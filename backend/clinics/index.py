import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30358746_hospital_website_red')
H = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}


def resp(status, body):
    return {'statusCode': status, 'headers': H, 'body': json.dumps(body, ensure_ascii=False, default=str), 'isBase64Encoded': False}


def handler(event: dict, context) -> dict:
    """Справочник отделений (поликлиник): список, добавление, изменение, скрытие"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    params = event.get('queryStringParameters') or {}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if method == 'GET':
        where = '' if params.get('all') == 'true' else 'WHERE is_active = TRUE'
        cur.execute(f"SELECT id, name, description, icon, sort_order, is_active FROM {SCHEMA}.clinics {where} ORDER BY sort_order, id")
        rows = cur.fetchall()
        conn.close()
        return resp(200, {'clinics': rows})

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        name = (body.get('name') or '').strip()
        if not name:
            conn.close()
            return resp(400, {'error': 'Название отделения обязательно'})
        cur.execute(f"SELECT 1 FROM {SCHEMA}.clinics WHERE name = %s", (name,))
        if cur.fetchone():
            conn.close()
            return resp(400, {'error': 'Отделение с таким названием уже есть'})
        cur.execute(
            f"INSERT INTO {SCHEMA}.clinics (name, description, icon, sort_order) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, (body.get('description') or '').strip(), body.get('icon') or 'Building2', int(body.get('sort_order') or 0))
        )
        new_id = cur.fetchone()['id']
        conn.commit()
        conn.close()
        return resp(200, {'success': True, 'id': new_id})

    if method == 'PUT':
        clinic_id = body.get('id')
        if not clinic_id:
            conn.close()
            return resp(400, {'error': 'id обязателен'})
        cur.execute(f"SELECT name FROM {SCHEMA}.clinics WHERE id = %s", (clinic_id,))
        current = cur.fetchone()
        if not current:
            conn.close()
            return resp(404, {'error': 'Отделение не найдено'})

        fields, values = [], []
        new_name = (body.get('name') or '').strip() if 'name' in body else None
        if new_name:
            cur.execute(f"SELECT 1 FROM {SCHEMA}.clinics WHERE name = %s AND id <> %s", (new_name, clinic_id))
            if cur.fetchone():
                conn.close()
                return resp(400, {'error': 'Отделение с таким названием уже есть'})
            fields.append('name = %s')
            values.append(new_name)
        for key in ('description', 'icon', 'sort_order', 'is_active'):
            if key in body:
                fields.append(f'{key} = %s')
                values.append(body[key])
        if not fields:
            conn.close()
            return resp(400, {'error': 'Нет данных для обновления'})
        values.append(clinic_id)
        cur.execute(f"UPDATE {SCHEMA}.clinics SET {', '.join(fields)} WHERE id = %s", values)

        if new_name and new_name != current['name']:
            cur.execute(f"UPDATE {SCHEMA}.doctors SET clinic = %s WHERE clinic = %s", (new_name, current['name']))
            cur.execute(f"UPDATE {SCHEMA}.registrars SET clinic = %s WHERE clinic = %s", (new_name, current['name']))
        conn.commit()
        conn.close()
        return resp(200, {'success': True})

    conn.close()
    return resp(405, {'error': 'Метод не поддерживается'})
