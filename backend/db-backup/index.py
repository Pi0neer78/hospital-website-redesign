"""
Сервис архивирования баз данных в S3-хранилище.
Поддерживает резервное копирование таблиц по расписанию, разовый полный архив и просмотр списка архивов.
"""
import json
import os
import csv
import io
import boto3
import psycopg2
from datetime import datetime, time

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


def table_to_csv(conn, table_name):
    cur = conn.cursor()
    cur.execute(f'SELECT * FROM "{SCHEMA}"."{table_name}"')
    rows = cur.fetchall()
    cols = [desc[0] for desc in cur.description]
    cur.close()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(cols)
    writer.writerows(rows)
    return buf.getvalue(), len(rows)


def upload_csv(s3, key, content):
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=content.encode('utf-8'),
        ContentType='text/csv; charset=utf-8',
    )
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def get_backup_settings(conn):
    cur = conn.cursor()
    cur.execute(f'''
        SELECT enabled, start_time, end_time, repeat_minutes
        FROM "{SCHEMA}".backup_settings
        WHERE id = 1
    ''')
    row = cur.fetchone()
    cur.close()
    if not row:
        return {'enabled': False, 'start_time': '02:00', 'end_time': '04:00', 'repeat_minutes': 0}
    return {
        'enabled': row[0],
        'start_time': str(row[1])[:5] if row[1] else '02:00',
        'end_time': str(row[2])[:5] if row[2] else '04:00',
        'repeat_minutes': row[3] or 0,
    }


def save_backup_record(conn, folder, full, results):
    success_results = [r for r in results if r.get('success')]
    total_rows = sum(r.get('rows', 0) for r in success_results)
    files_json = json.dumps([
        {'name': r['table'] + '.csv', 'url': r['url'], 'size': 0, 'rows': r.get('rows', 0)}
        for r in success_results
    ])
    cur = conn.cursor()
    cur.execute(f'''
        INSERT INTO "{SCHEMA}".backup_records (folder, full_backup, tables_count, total_rows, files)
        VALUES (%s, %s, %s, %s, %s)
    ''', (folder, full, len(success_results), total_rows, files_json))
    conn.commit()
    cur.close()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

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
            INSERT INTO "{SCHEMA}".backup_settings (id, enabled, start_time, end_time, repeat_minutes)
            VALUES (1, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                enabled = EXCLUDED.enabled,
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                repeat_minutes = EXCLUDED.repeat_minutes,
                updated_at = NOW()
        ''', (
            body.get('enabled', False),
            body.get('start_time', '02:00'),
            body.get('end_time', '04:00'),
            body.get('repeat_minutes', 0),
        ))
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True}),
        }

    if method == 'POST' and action == 'backup':
        body = json.loads(event.get('body') or '{}')
        full = body.get('full', False)

        now = datetime.now()
        dt_str = now.strftime('%Y-%m-%d_%H-%M-%S')

        if full:
            folder = f'backups/полный_архив_{dt_str}'
        else:
            folder = f'backups/{dt_str}'

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
                csv_content, row_count = table_to_csv(conn, table)
                key = f'{folder}/{table}.csv'
                url = upload_csv(s3, key, csv_content)
                results.append({'table': table, 'rows': row_count, 'url': url, 'success': True})
            except Exception as e:
                print(f'[backup error] table={table} error={e}')
                results.append({'table': table, 'error': str(e), 'success': False})

        save_backup_record(conn, folder, full, results)
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'folder': folder, 'results': results, 'datetime': dt_str}),
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

        now = datetime.now()
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
        folder = f'backups/{dt_str}'

        s3 = get_s3()
        results = []

        for table in BACKUP_TABLES:
            try:
                csv_content, row_count = table_to_csv(conn, table)
                key = f'{folder}/{table}.csv'
                url = upload_csv(s3, key, csv_content)
                results.append({'table': table, 'rows': row_count, 'url': url, 'success': True})
            except Exception as e:
                print(f'[scheduled error] table={table} error={e}')
                results.append({'table': table, 'error': str(e), 'success': False})

        save_backup_record(conn, folder, False, results)
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'folder': folder, 'results': results}),
        }

    if method == 'GET' and action == 'list':
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f'''
            SELECT folder, full_backup, tables_count, total_rows, files, created_at
            FROM "{SCHEMA}".backup_records
            ORDER BY created_at DESC
            LIMIT 100
        ''')
        rows = cur.fetchall()
        cur.close()
        conn.close()

        folders = []
        for row in rows:
            folder_name = row[0].replace('backups/', '', 1)
            files_data = json.loads(row[4]) if row[4] else []
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
                'total_size': 0,
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
