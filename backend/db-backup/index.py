"""
Сервис архивирования баз данных в S3-хранилище.
Поддерживает резервное копирование таблиц по расписанию, разовый полный архив, просмотр и очистку старых архивов.
"""
import json
import os
import csv
import io
import tempfile
import hashlib
import secrets
import time as time_module
import boto3
import psycopg2
from datetime import datetime, time, timedelta, timezone

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30358746_hospital_website_red')
BACKUP_TABLES = ['appointments_v2', 'daily_schedules', 'doctor_calendar', 'doctor_schedules']

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


PAGE_SIZE = 5000
PAGES_PER_CALL = 4


def fetch_page(conn, table_name, offset):
    for attempt in range(4):
        try:
            cur = conn.cursor()
            cur.execute(f'SELECT * FROM "{SCHEMA}"."{table_name}" ORDER BY ctid LIMIT {PAGE_SIZE} OFFSET {offset}')
            rows = cur.fetchall()
            header = [d[0] for d in cur.description]
            cur.close()
            return rows, header
        except psycopg2.errors.QueryCanceled:
            if attempt == 3:
                raise
            time_module.sleep(1.0 * (attempt + 1))
            try:
                conn.rollback()
            except Exception:
                pass


def backup_table_part(conn, s3, table_name, folder, offset):
    """Выгрузить часть таблицы (до PAGES_PER_CALL страниц) в CSV и вернуть, где продолжить"""
    part = offset // (PAGE_SIZE * PAGES_PER_CALL) + 1
    file_table = table_name if part == 1 else f'{table_name}_часть_{part}'
    key = f'{folder}/{file_table}.csv'
    row_count = 0
    next_offset = None
    with tempfile.TemporaryFile(mode='w+b') as tmp:
        text = io.TextIOWrapper(tmp, encoding='utf-8', newline='', write_through=True)
        writer = csv.writer(text)
        header_written = False
        current = offset
        for _ in range(PAGES_PER_CALL):
            rows, header = fetch_page(conn, table_name, current)
            if not header_written:
                writer.writerow(header)
                header_written = True
            writer.writerows(rows)
            row_count += len(rows)
            current += PAGE_SIZE
            if len(rows) < PAGE_SIZE:
                break
        else:
            next_offset = current
        text.flush()
        size = tmp.tell()
        tmp.seek(0)
        s3.put_object(Bucket='files', Key=key, Body=tmp, ContentLength=size, ContentType='text/csv; charset=utf-8')
        text.detach()
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    if next_offset is not None:
        rows, _ = fetch_page(conn, table_name, next_offset)
        if not rows:
            next_offset = None
    return {'table': file_table, 'rows': row_count, 'url': url, 'size': size, 'success': True, 'next_offset': next_offset}


def backup_table(conn, s3, table_name, key):
    offset = 0
    total_rows = 0
    total_size = 0
    folder = key.rsplit('/', 1)[0]
    url = ''
    while True:
        r = backup_table_part(conn, s3, table_name, folder, offset)
        total_rows += r['rows']
        total_size += r['size']
        url = r['url'] if offset == 0 else url
        if r['next_offset'] is None:
            break
        offset = r['next_offset']
    return url, total_size, total_rows


def get_backup_settings(conn):
    cur = conn.cursor()
    cur.execute(f'''
        SELECT enabled, start_time, end_time, repeat_minutes, retention_days
        FROM "{SCHEMA}".backup_settings
        WHERE id = 1
    ''')
    row = cur.fetchone()
    cur.close()
    if not row:
        return {'enabled': False, 'start_time': '02:00', 'end_time': '04:00', 'repeat_minutes': 0, 'retention_days': 0}
    return {
        'enabled': row[0],
        'start_time': str(row[1])[:5] if row[1] else '02:00',
        'end_time': str(row[2])[:5] if row[2] else '04:00',
        'repeat_minutes': row[3] or 0,
        'retention_days': row[4] or 0,
    }


def save_backup_record(conn, folder, full, results):
    success_results = [r for r in results if r.get('success')]
    total_rows = sum(r.get('rows', 0) for r in success_results)
    files_json = json.dumps([
        {'name': r['table'] + '.csv', 'url': r['url'], 'size': r.get('size', 0), 'rows': r.get('rows', 0)}
        for r in success_results
    ])
    cur = conn.cursor()
    cur.execute(f'''
        INSERT INTO "{SCHEMA}".backup_records (folder, full_backup, tables_count, total_rows, files)
        VALUES (%s, %s, %s, %s, %s)
    ''', (folder, full, len(success_results), total_rows, files_json))
    conn.commit()
    cur.close()


def delete_s3_folder(s3, folder):
    try:
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket='files', Prefix=folder + '/')
        keys = []
        for page in pages:
            for obj in page.get('Contents', []):
                keys.append({'Key': obj['Key']})
        if keys:
            s3.delete_objects(Bucket='files', Delete={'Objects': keys})
    except Exception as e:
        print(f'[s3 delete error] folder={folder} error={e}')


def delete_old_records(conn, retention_days, s3=None):
    if retention_days <= 0:
        return 0
    cutoff = datetime.now() - timedelta(days=retention_days)
    cur = conn.cursor()
    cur.execute(f'''
        DELETE FROM "{SCHEMA}".backup_records
        WHERE created_at < %s AND full_backup = false
        RETURNING folder
    ''', (cutoff,))
    deleted_folders = [r[0] for r in cur.fetchall()]
    conn.commit()
    cur.close()
    if s3 and deleted_folders:
        for folder in deleted_folders:
            delete_s3_folder(s3, folder)
    return len(deleted_folders)


LOG_TABLES = {
    'doctor_logs': 'журнал действий докторов',
    'registrar_logs': 'журнал действий регистраторов',
}
LOG_BATCH = 8000


def logs_cutoff():
    """Первое число предыдущего месяца (по Москве): всё, что раньше, подлежит удалению"""
    now = datetime.now(timezone.utc) + timedelta(hours=3)
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    return (first_of_month - timedelta(days=1)).replace(day=1)


def delete_logs_batch(conn, table, cutoff):
    for attempt in range(4):
        try:
            cur = conn.cursor()
            cur.execute(f'''
                DELETE FROM "{SCHEMA}"."{table}"
                WHERE id IN (
                    SELECT id FROM "{SCHEMA}"."{table}" WHERE created_at < %s LIMIT {LOG_BATCH}
                )
            ''', (cutoff,))
            deleted = cur.rowcount
            conn.commit()
            cur.close()
            return deleted
        except psycopg2.errors.QueryCanceled:
            try:
                conn.rollback()
            except Exception:
                pass
            if attempt == 3:
                raise
            time_module.sleep(1.0 * (attempt + 1))


PUBLIC_ACTIONS = {'scheduled'}


def verify_admin(event, conn) -> bool:
    """Проверить временный токен администратора из заголовка X-Admin-Token"""
    headers = event.get('headers') or {}
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    if not token:
        return False
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
    cur = conn.cursor()
    try:
        cur.execute(
            f'''
            SELECT 1 FROM "{SCHEMA}".admin_sessions s
            JOIN "{SCHEMA}".admins a ON a.id = s.admin_id
            WHERE s.token_hash = %s AND s.expires_at > NOW() AND a.is_active = true
            ''',
            (token_hash,)
        )
        return cur.fetchone() is not None
    finally:
        cur.close()


def new_archive_folder(name):
    """Папка архива с непредсказуемым сегментом в пути, чтобы файлы нельзя было найти по угадыванию адреса"""
    return f"backups/{secrets.token_urlsafe(16)}/{name}"


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if action not in PUBLIC_ACTIONS:
        auth_conn = get_db()
        try:
            allowed = verify_admin(event, auth_conn)
        finally:
            auth_conn.close()
        if not allowed:
            return {
                'statusCode': 401,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Требуется вход администратора'}),
            }

    if method == 'GET' and action == 'settings':
        conn = get_db()
        settings = get_backup_settings(conn)
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'settings': settings}),
        }

    if method == 'PUT' and action == 'settings':
        body = json.loads(event.get('body') or '{}')
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f'''
            INSERT INTO "{SCHEMA}".backup_settings (id, enabled, start_time, end_time, repeat_minutes, retention_days)
            VALUES (1, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                enabled = EXCLUDED.enabled,
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                repeat_minutes = EXCLUDED.repeat_minutes,
                retention_days = EXCLUDED.retention_days,
                updated_at = NOW()
        ''', (
            body.get('enabled', False),
            body.get('start_time', '02:00'),
            body.get('end_time', '04:00'),
            body.get('repeat_minutes', 0),
            body.get('retention_days', 0),
        ))
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True}),
        }

    if method == 'POST' and action == 'cleanup':
        body = json.loads(event.get('body') or '{}')
        retention_days = body.get('retention_days', 0)
        if retention_days <= 0:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'retention_days должен быть больше 0'}),
            }
        conn = get_db()
        s3 = get_s3()
        deleted = delete_old_records(conn, retention_days, s3)
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'deleted': deleted}),
        }

    if method == 'POST' and action == 'logs_cleanup_info':
        cutoff = logs_cutoff()
        conn = get_db()
        cur = conn.cursor()
        tables = []
        total = 0
        for table, title in LOG_TABLES.items():
            cur.execute(f'SELECT count(*) FROM "{SCHEMA}"."{table}" WHERE created_at < %s', (cutoff,))
            count = cur.fetchone()[0]
            total += count
            tables.append({'table': table, 'title': title, 'count': count})
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'cutoff': cutoff.strftime('%d.%m.%Y'), 'tables': tables, 'total': total}),
        }

    if method == 'POST' and action == 'logs_cleanup_step':
        body = json.loads(event.get('body') or '{}')
        table = str(body.get('table', ''))
        if table not in LOG_TABLES:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Unknown table'}),
            }
        conn = get_db()
        deleted = delete_logs_batch(conn, table, logs_cutoff())
        conn.close()
        print(f'[logs cleanup] table={table} deleted={deleted}')
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'table': table, 'deleted': deleted, 'finished': deleted < LOG_BATCH}),
        }

    if method == 'POST' and action == 'backup_start':
        now = datetime.now(timezone.utc) + timedelta(hours=3)
        folder = new_archive_folder(f"полный_архив_{now.strftime('%Y-%m-%d_%H-%M-%S')}")
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT tablename FROM pg_tables WHERE schemaname = %s ORDER BY tablename', (SCHEMA,))
        tables = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'folder': folder, 'tables': tables}),
        }

    if method == 'POST' and action == 'backup_part':
        body = json.loads(event.get('body') or '{}')
        table = str(body.get('table', ''))
        folder = str(body.get('folder', ''))
        offset = int(body.get('offset', 0))
        conn = get_db()
        cur = conn.cursor()
        cur.execute('SELECT 1 FROM pg_tables WHERE schemaname = %s AND tablename = %s', (SCHEMA, table))
        known = cur.fetchone()
        cur.close()
        if not known or not folder.startswith('backups/') or '..' in folder:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Bad table or folder'}),
            }
        result = backup_table_part(conn, get_s3(), table, folder, offset)
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps(result),
        }

    if method == 'POST' and action == 'backup_finish':
        body = json.loads(event.get('body') or '{}')
        folder = str(body.get('folder', ''))
        results = body.get('results', [])
        conn = get_db()
        save_backup_record(conn, folder, True, results)
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True}),
        }

    if method == 'POST' and action == 'backup':
        body = json.loads(event.get('body') or '{}')
        full = body.get('full', False)

        now = datetime.now(timezone.utc) + timedelta(hours=3)
        dt_str = now.strftime('%Y-%m-%d_%H-%M-%S')

        if full:
            folder = new_archive_folder(f'полный_архив_{dt_str}')
        else:
            folder = new_archive_folder(dt_str)

        conn = get_db()
        s3 = get_s3()
        results = []

        tables = BACKUP_TABLES
        if full:
            cur = conn.cursor()
            cur.execute(f'''
                SELECT tablename FROM pg_tables WHERE schemaname = %s ORDER BY tablename
            ''', (SCHEMA,))
            tables = [row[0] for row in cur.fetchall()]
            cur.close()

        for table in tables:
            try:
                key = f'{folder}/{table}.csv'
                url, size, row_count = backup_table(conn, s3, table, key)
                results.append({'table': table, 'rows': row_count, 'url': url, 'size': size, 'success': True})
            except Exception as e:
                try:
                    conn.rollback()
                except Exception:
                    conn = get_db()
                print(f'[backup error] table={table} error={e}')
                results.append({'table': table, 'error': str(e), 'success': False})

        save_backup_record(conn, folder, full, results)
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'folder': folder, 'results': results, 'datetime': dt_str}),
        }

    if method == 'POST' and action == 'clear_all':
        conn = get_db()
        s3 = get_s3()
        cur = conn.cursor()
        cur.execute(f'SELECT folder FROM "{SCHEMA}".backup_records')
        all_folders = [r[0] for r in cur.fetchall()]
        cur.close()

        try:
            paginator = s3.get_paginator('list_objects_v2')
            pages = paginator.paginate(Bucket='files', Prefix='backups/')
            keys = []
            for page in pages:
                for obj in page.get('Contents', []):
                    keys.append({'Key': obj['Key']})
            if keys:
                s3.delete_objects(Bucket='files', Delete={'Objects': keys})
        except Exception as e:
            print(f'[clear_all s3 error] {e}')

        cur = conn.cursor()
        cur.execute(f'DELETE FROM "{SCHEMA}".backup_records')
        deleted_count = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'deleted_records': deleted_count, 'deleted_s3_files': len(keys) if 'keys' in dir() else 0}),
        }

    if method == 'POST' and action == 'scheduled':
        conn = get_db()
        settings = get_backup_settings(conn)

        if not settings['enabled']:
            conn.close()
            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'skipped': True, 'reason': 'backup disabled'}),
            }

        now = datetime.now(timezone.utc) + timedelta(hours=3)
        current_time = now.time()
        start = time(*map(int, settings['start_time'].split(':')))
        end = time(*map(int, settings['end_time'].split(':')))

        if not (start <= current_time <= end):
            conn.close()
            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'skipped': True, 'reason': 'outside time window'}),
            }

        dt_str = now.strftime('%Y-%m-%d_%H-%M-%S')
        folder = new_archive_folder(dt_str)
        s3 = get_s3()
        results = []

        for table in BACKUP_TABLES:
            try:
                key = f'{folder}/{table}.csv'
                url, size, row_count = backup_table(conn, s3, table, key)
                results.append({'table': table, 'rows': row_count, 'url': url, 'size': size, 'success': True})
            except Exception as e:
                conn.rollback()
                print(f'[scheduled error] table={table} error={e}')
                results.append({'table': table, 'error': str(e), 'success': False})

        save_backup_record(conn, folder, False, results)

        deleted = 0
        if settings['retention_days'] > 0:
            deleted = delete_old_records(conn, settings['retention_days'], s3)

        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'tables_saved': sum(1 for r in results if r.get('success')), 'tables_failed': sum(1 for r in results if not r.get('success')), 'deleted_old': deleted}),
        }

    if method == 'GET' and action == 'list':
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f'''
            SELECT folder, full_backup, tables_count, total_rows, files, created_at
            FROM "{SCHEMA}".backup_records
            ORDER BY created_at DESC
            LIMIT 500
        ''')
        rows = cur.fetchall()
        cur.close()
        conn.close()

        folders = []
        for row in rows:
            folder_name = row[0].rsplit('/', 1)[-1]
            raw = row[4]
            files_data = raw if isinstance(raw, list) else (json.loads(raw) if raw else [])
            files = [
                {
                    'name': f['name'],
                    'size': f.get('size', 0),
                    'rows': f.get('rows', 0),
                    'url': f['url'],
                    'last_modified': row[5].isoformat(),
                }
                for f in files_data
            ]
            folders.append({
                'folder': folder_name,
                'full': row[1],
                'file_count': row[2],
                'total_rows': row[3],
                'total_size': sum(f['size'] for f in files),
                'files': files,
                'created_at': row[5].isoformat(),
            })

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'folders': folders}, default=str),
        }

    return {
        'statusCode': 400,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Unknown action'}),
    }