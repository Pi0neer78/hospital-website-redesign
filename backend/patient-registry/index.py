import json
import os
import smtplib
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

SCHEMA = 't_p30358746_hospital_website_red'
CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Реестр пациентов — получение, массовая рассылка email/MAX"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return resp(500, {'error': 'Ошибка конфигурации БД'})

    conn = psycopg2.connect(database_url)

    try:
        if method == 'GET':
            return handle_get(conn, event)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')

            if action == 'send_email':
                return handle_send_email(conn, body)
            elif action == 'send_max':
                return handle_send_max(conn, body)
            else:
                return resp(400, {'error': 'Неизвестное действие'})
        else:
            return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()


def handle_get(conn, event):
    params = event.get('queryStringParameters') or {}
    search = params.get('search', '')

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    query = f"SELECT * FROM {SCHEMA}.reest_phone_max"
    query_params = []

    if search:
        query += " WHERE full_name ILIKE %s OR phone ILIKE %s OR email ILIKE %s"
        s = f'%{search}%'
        query_params = [s, s, s]

    query += " ORDER BY created_at DESC LIMIT 500"

    cursor.execute(query, tuple(query_params))
    rows = cursor.fetchall()
    cursor.close()

    return resp(200, {'records': rows})


def handle_send_email(conn, body):
    ids = body.get('ids', [])
    message_text = body.get('message', '')

    if not ids or not message_text:
        return resp(400, {'error': 'Укажите получателей и текст сообщения'})

    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    from_email = os.environ.get('FROM_EMAIL', smtp_user)

    if not smtp_user or not smtp_password:
        return resp(500, {'error': 'Настройки SMTP не указаны'})

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    placeholders = ','.join(['%s'] * len(ids))
    cursor.execute(
        f"SELECT * FROM {SCHEMA}.reest_phone_max WHERE id IN ({placeholders})",
        tuple(ids)
    )
    records = cursor.fetchall()

    sent_count = 0
    errors = []

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)

        for rec in records:
            email = rec.get('email')
            if not email:
                errors.append(f"{rec.get('full_name', '?')}: нет email")
                continue

            msg = MIMEMultipart()
            msg['From'] = from_email
            msg['To'] = email
            msg['Subject'] = 'Сообщение от ГБУЗ АЦГМБ ЛНР'
            msg.attach(MIMEText(message_text, 'plain', 'utf-8'))

            try:
                server.send_message(msg)
                sent_count += 1
                now = datetime.now().isoformat()
                cursor.execute(
                    f"UPDATE {SCHEMA}.reest_phone_max SET last_email_text = %s, last_email_sent_at = %s, updated_at = NOW() WHERE id = %s",
                    (message_text, now, rec['id'])
                )
            except Exception as e:
                errors.append(f"{email}: {str(e)}")

        server.quit()
    except Exception as e:
        return resp(500, {'error': f'Ошибка SMTP: {str(e)}'})

    conn.commit()
    cursor.close()

    return resp(200, {
        'success': True,
        'sent_count': sent_count,
        'errors': errors
    })


def handle_send_max(conn, body):
    ids = body.get('ids', [])
    message_text = body.get('message', '')

    if not ids or not message_text:
        return resp(400, {'error': 'Укажите получателей и текст сообщения'})

    green_api_instance_id = os.environ.get('GREEN_API_INSTANCE_ID')
    green_api_token = os.environ.get('GREEN_API_TOKEN')

    if not green_api_instance_id or not green_api_token:
        return resp(500, {'error': 'Настройки GREEN-API не указаны'})

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    placeholders = ','.join(['%s'] * len(ids))
    cursor.execute(
        f"SELECT * FROM {SCHEMA}.reest_phone_max WHERE id IN ({placeholders})",
        tuple(ids)
    )
    records = cursor.fetchall()

    sent_count = 0
    errors = []

    for rec in records:
        phone = rec.get('phone')
        if not phone:
            errors.append(f"{rec.get('full_name', '?')}: нет телефона")
            continue

        clean_phone = ''.join(filter(str.isdigit, phone))
        if len(clean_phone) < 10:
            errors.append(f"{phone}: некорректный номер")
            continue

        chat_id = f"{clean_phone}@c.us"
        request_data = json.dumps({
            'chatId': chat_id,
            'message': message_text
        }).encode('utf-8')

        url = f'https://api.green-api.com/v3/waInstance{green_api_instance_id}/sendMessage/{green_api_token}'

        try:
            req = urllib.request.Request(
                url,
                data=request_data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                json.loads(response.read().decode('utf-8'))

            sent_count += 1
            now = datetime.now().isoformat()
            cursor.execute(
                f"UPDATE {SCHEMA}.reest_phone_max SET last_max_text = %s, last_max_sent_at = %s, updated_at = NOW() WHERE id = %s",
                (message_text, now, rec['id'])
            )
        except Exception as e:
            errors.append(f"{phone}: {str(e)}")

    conn.commit()
    cursor.close()

    return resp(200, {
        'success': True,
        'sent_count': sent_count,
        'errors': errors
    })


def resp(status_code, body):
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }
