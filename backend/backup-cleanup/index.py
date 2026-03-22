import json
import os
import boto3
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30358746_hospital_website_red')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


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


def handler(event: dict, context) -> dict:
    """
    Cron-функция автоматической очистки старых архивов БД.
    Читает параметр retention_days из настроек. Если 0 — не удаляет ничего.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    conn = get_db()
    cur = conn.cursor()
    cur.execute(f'''
        SELECT retention_days FROM "{SCHEMA}".backup_settings WHERE id = 1
    ''')
    row = cur.fetchone()
    cur.close()

    retention_days = row[0] if row else 0

    if retention_days <= 0:
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'skipped': True, 'reason': 'retention_days = 0, удаление отключено'}),
        }

    cutoff = datetime.now() - timedelta(days=retention_days)
    cur = conn.cursor()
    cur.execute(f'''
        DELETE FROM "{SCHEMA}".backup_records
        WHERE created_at < %s
        RETURNING folder
    ''', (cutoff,))
    deleted_folders = [r[0] for r in cur.fetchall()]
    conn.commit()
    cur.close()
    conn.close()

    s3 = get_s3()
    for folder in deleted_folders:
        delete_s3_folder(s3, folder)

    print(f'[cleanup] retention_days={retention_days}, cutoff={cutoff}, deleted={len(deleted_folders)}')

    return {
        'statusCode': 200,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'deleted': len(deleted_folders), 'cutoff': cutoff.isoformat()}),
    }