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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            params = event.get('queryStringParameters') or {}
            if params.get('action') == 'logs':
                return handle_get_logs(conn, params)
            return handle_get(conn, event)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')

            if action == 'send_email':
                return handle_send_email(conn, body)
            elif action == 'send_max':
                return handle_send_max(conn, body)
            elif action == 'update':
                return handle_update(conn, body)
            elif action == 'delete':
                return handle_delete(conn, body)
            elif action == 'log':
                return handle_log(conn, body, event)
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


def handle_update(conn, body):
    rec_id = body.get('id')
    if not rec_id:
        return resp(400, {'error': 'Не указан id записи'})

    full_name = body.get('full_name', '').strip()
    phone = body.get('phone', '').strip() or None
    email = body.get('email', '').strip() or None

    if not full_name:
        return resp(400, {'error': 'ФИО обязательно'})

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    if phone:
        cursor.execute(f"SELECT id FROM {SCHEMA}.reest_phone_max WHERE phone = %s AND id != %s", (phone, rec_id))
        if cursor.fetchone():
            cursor.close()
            return resp(400, {'error': 'Такой номер телефона уже есть в реестре'})

    if email:
        cursor.execute(f"SELECT id FROM {SCHEMA}.reest_phone_max WHERE email = %s AND id != %s", (email, rec_id))
        if cursor.fetchone():
            cursor.close()
            return resp(400, {'error': 'Такой email уже есть в реестре'})

    cursor.execute(
        f"UPDATE {SCHEMA}.reest_phone_max SET full_name = %s, phone = %s, email = %s, updated_at = NOW() WHERE id = %s",
        (full_name, phone, email, rec_id)
    )
    conn.commit()
    cursor.close()
    return resp(200, {'success': True})


def handle_delete(conn, body):
    rec_id = body.get('id')
    ids = body.get('ids', [])

    if not rec_id and not ids:
        return resp(400, {'error': 'Не указан id записи'})

    cursor = conn.cursor()

    if ids:
        placeholders = ','.join(['%s'] * len(ids))
        cursor.execute(f"DELETE FROM {SCHEMA}.reest_phone_max WHERE id IN ({placeholders})", tuple(ids))
        deleted = cursor.rowcount
    else:
        cursor.execute(f"DELETE FROM {SCHEMA}.reest_phone_max WHERE id = %s", (rec_id,))
        deleted = cursor.rowcount

    conn.commit()
    cursor.close()
    return resp(200, {'success': True, 'deleted': deleted})


def handle_log(conn, body, event):
    admin_login = body.get('admin_login', '')
    action_type = body.get('action_type', '')
    details = body.get('details', '')

    if not action_type:
        return resp(400, {'error': 'action_type обязателен'})

    headers_req = event.get('headers', {})
    ip_address = (
        headers_req.get('X-Forwarded-For', '').split(',')[0].strip() or
        headers_req.get('X-Real-IP', '') or
        event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    )
    computer_name = body.get('computer_name', '')

    cursor = conn.cursor()
    cursor.execute(
        f"INSERT INTO {SCHEMA}.mdoctor_logs (admin_login, action_type, details, ip_address, computer_name) VALUES (%s, %s, %s, %s, %s)",
        (admin_login, action_type, details, ip_address, computer_name)
    )
    conn.commit()
    cursor.close()
    return resp(200, {'success': True})


def handle_get_logs(conn, params):
    admin_login = params.get('admin_login', '')
    limit = int(params.get('limit', '200'))
    if limit > 1000:
        limit = 1000

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    if admin_login:
        cursor.execute(
            f"SELECT id, admin_login, action_type, details, ip_address, computer_name, created_at FROM {SCHEMA}.mdoctor_logs WHERE admin_login = %s ORDER BY created_at DESC LIMIT %s",
            (admin_login, limit)
        )
    else:
        cursor.execute(
            f"SELECT id, admin_login, action_type, details, ip_address, computer_name, created_at FROM {SCHEMA}.mdoctor_logs ORDER BY created_at DESC LIMIT %s",
            (limit,)
        )

    logs = cursor.fetchall()
    cursor.close()
    return resp(200, {'logs': logs})


def resp(status_code, body):
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }