import json
import os
import urllib.request


DB_BACKUP_URL = 'https://functions.poehali.dev/44a9271b-91c3-434f-a4ed-a10b64718f46'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def handler(event: dict, context) -> dict:
    """
    Cron-функция автоматического архивирования БД.
    Вызывается по расписанию и запускает плановый бэкап через db-backup.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    req = urllib.request.Request(
        f'{DB_BACKUP_URL}?action=scheduled',
        method='POST',
        headers={'Content-Type': 'application/json'},
        data=b'{}',
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read().decode())

    return {
        'statusCode': 200,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'result': result}),
    }
