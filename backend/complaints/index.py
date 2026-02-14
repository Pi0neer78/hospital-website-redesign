import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработка жалоб и предложений
    Методы: POST - создать жалобу, GET - получить все жалобы
    """
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
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка конфигурации базы данных'}),
            'isBase64Encoded': False
        }
    
    # Получаем IP-адрес клиента
    source_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    
    conn = psycopg2.connect(database_url)
    
    try:
        # Проверка блокировки IP
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT * FROM t_p30358746_hospital_website_red.blocked_ips WHERE ip_address = %s AND blocked_until > NOW()",
            (source_ip,)
        )
        blocked = cursor.fetchone()
        cursor.close()
        
        if blocked:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Доступ заблокирован',
                    'reason': blocked.get('reason', ''),
                    'blocked_until': str(blocked.get('blocked_until', ''))
                }),
                'isBase64Encoded': False
            }
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')
            
            if action == 'update_status':
                complaint_id = body.get('complaint_id')
                status = body.get('status')
                comment = body.get('comment', '')
                resolved_at = body.get('resolved_at')
                responded_at = body.get('responded_at')
                admin_login = body.get('admin_login', 'admin')
                
                if not complaint_id or not status:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Не заполнены обязательные поля'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                # Получаем старые данные жалобы для логирования
                cursor.execute("SELECT * FROM t_p30358746_hospital_website_red.complaints WHERE id = %s", (complaint_id,))
                old_complaint = cursor.fetchone()
                
                # Формируем SQL запрос в зависимости от переданных полей
                update_fields = ['status = %s', 'comment = %s']
                update_values = [status, comment]
                
                if resolved_at:
                    update_fields.append('resolved_at = %s')
                    update_values.append(resolved_at)
                
                if responded_at:
                    update_fields.append('responded_at = %s')
                    update_values.append(responded_at)
                
                max_responded_at = body.get('max_responded_at')
                if max_responded_at:
                    update_fields.append('max_responded_at = %s')
                    update_values.append(max_responded_at)
                
                update_values.append(complaint_id)
                
                cursor.execute(
                    f"UPDATE t_p30358746_hospital_website_red.complaints SET {', '.join(update_fields)} WHERE id = %s",
                    tuple(update_values)
                )
                
                # Логируем действие в журнал
                if old_complaint:
                    action_text = f"Изменён статус жалобы №{complaint_id} от {old_complaint.get('name', 'Неизвестно')}. Старый статус: {old_complaint.get('status', 'неизвестно')}, новый: {status}. Комментарий: {comment}"
                    cursor.execute(
                        "INSERT INTO t_p30358746_hospital_website_red.doctor_logs (user_login, action_type, details) VALUES (%s, %s, %s)",
                        (admin_login, 'update_complaint', action_text)
                    )
                
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Статус жалобы обновлён'}),
                    'isBase64Encoded': False
                }
            
            else:  # create complaint
                name = body.get('name')
                email = body.get('email')
                phone = body.get('phone')
                message = body.get('message')
                
                if not all([name, email, phone, message]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Не заполнены обязательные поля'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(
                    "INSERT INTO t_p30358746_hospital_website_red.complaints (name, email, phone, message, status) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at",
                    (name, email, phone, message, 'new')
                )
                result = cursor.fetchone()

                upsert_registry(cursor, name, phone, email, 'complaint')

                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'id': result['id'],
                        'message': 'Жалоба успешно отправлена'
                    }, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("SELECT * FROM t_p30358746_hospital_website_red.complaints ORDER BY created_at DESC LIMIT 100")
            complaints = cursor.fetchall()
            cursor.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'complaints': complaints}, default=str),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()


def upsert_registry(cursor, full_name, phone, email, source_type):
    now = datetime.now().isoformat()
    if phone:
        cursor.execute(
            "SELECT id FROM t_p30358746_hospital_website_red.reest_phone_max WHERE phone = %s",
            (phone,)
        )
        existing = cursor.fetchone()
        if existing:
            fields = ['updated_at = NOW()']
            vals = []
            if source_type == 'complaint':
                fields.append('complaint_date = %s')
                vals.append(now)
            if full_name:
                fields.append('full_name = %s')
                vals.append(full_name)
            if email:
                cursor.execute(
                    "SELECT id FROM t_p30358746_hospital_website_red.reest_phone_max WHERE email = %s AND id != %s",
                    (email, existing['id'])
                )
                dup = cursor.fetchone()
                if not dup:
                    fields.append('email = %s')
                    vals.append(email)
            vals.append(existing['id'])
            cursor.execute(
                f"UPDATE t_p30358746_hospital_website_red.reest_phone_max SET {', '.join(fields)} WHERE id = %s",
                tuple(vals)
            )
            return

    if email:
        cursor.execute(
            "SELECT id FROM t_p30358746_hospital_website_red.reest_phone_max WHERE email = %s",
            (email,)
        )
        existing = cursor.fetchone()
        if existing:
            fields = ['updated_at = NOW()']
            vals = []
            if source_type == 'complaint':
                fields.append('complaint_date = %s')
                vals.append(now)
            if full_name:
                fields.append('full_name = %s')
                vals.append(full_name)
            if phone:
                cursor.execute(
                    "SELECT id FROM t_p30358746_hospital_website_red.reest_phone_max WHERE phone = %s AND id != %s",
                    (phone, existing['id'])
                )
                dup = cursor.fetchone()
                if not dup:
                    fields.append('phone = %s')
                    vals.append(phone)
            vals.append(existing['id'])
            cursor.execute(
                f"UPDATE t_p30358746_hospital_website_red.reest_phone_max SET {', '.join(fields)} WHERE id = %s",
                tuple(vals)
            )
            return

    complaint_date = now if source_type == 'complaint' else None
    appointment_date = now if source_type == 'appointment' else None
    cursor.execute(
        "INSERT INTO t_p30358746_hospital_website_red.reest_phone_max (full_name, phone, email, source_type, complaint_date, appointment_date) VALUES (%s, %s, %s, %s, %s, %s)",
        (full_name, phone or None, email or None, source_type, complaint_date, appointment_date)
    )