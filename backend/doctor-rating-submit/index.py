import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event, context):
    """Отправка оценки врача (1 раз в 7 дней с одного IP/браузера на одного врача)"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers_in = event.get('headers') or {}
    ip_address = headers_in.get('x-forwarded-for', '').split(',')[0].strip() or headers_in.get('x-real-ip', '') or (event.get('requestContext') or {}).get('identity', {}).get('sourceIp', '')

    if event.get('httpMethod') == 'GET':
        # Проверка: голосовал ли уже этот IP/fingerprint за врача на этой неделе
        params = event.get('queryStringParameters') or {}
        doctor_id = params.get('doctor_id')
        fingerprint = params.get('fingerprint', '')

        if not doctor_id:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'doctor_id required'})}

        week_ago = datetime.now() - timedelta(days=7)
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM t_p30358746_hospital_website_red.doctor_ratings WHERE doctor_id = %s AND voted_at >= %s AND fingerprint = %s",
            (int(doctor_id), week_ago, fingerprint)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        already_voted = row is not None
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'already_voted': already_voted})}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    doctor_id = body.get('doctor_id')
    rating = body.get('rating')
    fingerprint = body.get('fingerprint', '')
    user_agent = headers_in.get('user-agent', '')

    if not doctor_id or not rating:
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Не все данные переданы'}, ensure_ascii=False)}

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Оценка должна быть от 1 до 5'}, ensure_ascii=False)}

    week_ago = datetime.now() - timedelta(days=7)
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM t_p30358746_hospital_website_red.doctor_ratings WHERE doctor_id = %s AND voted_at >= %s AND fingerprint = %s",
        (int(doctor_id), week_ago, fingerprint)
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Вы уже голосовали за этого врача на этой неделе'}, ensure_ascii=False)}

    cur.execute(
        "INSERT INTO t_p30358746_hospital_website_red.doctor_ratings (doctor_id, rating, ip_address, user_agent, fingerprint) VALUES (%s, %s, %s, %s, %s)",
        (int(doctor_id), rating, ip_address, user_agent, fingerprint)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': True, 'message': 'Спасибо за вашу оценку!'}, ensure_ascii=False)}