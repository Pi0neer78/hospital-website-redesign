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
            'body': json.dumps({'error': 'Database configuration missing'}),
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
                admin_login = body.get('admin_login', 'admin')
                
                if not complaint_id or not status:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing fields'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                # Получаем старые данные жалобы для логирования
                cursor.execute("SELECT * FROM complaints WHERE id = %s", (complaint_id,))
                old_complaint = cursor.fetchone()
                
                # Обновляем жалобу
                if resolved_at:
                    cursor.execute(
                        "UPDATE complaints SET status = %s, comment = %s, resolved_at = %s WHERE id = %s",
                        (status, comment, resolved_at, complaint_id)
                    )
                else:
                    cursor.execute(
                        "UPDATE complaints SET status = %s, comment = %s WHERE id = %s",
                        (status, comment, complaint_id)
                    )
                
                # Логируем действие в журнал
                if old_complaint:
                    action_text = f"Изменён статус жалобы №{complaint_id} от {old_complaint.get('name', 'Неизвестно')}. Старый статус: {old_complaint.get('status', 'неизвестно')}, новый: {status}. Комментарий: {comment}"
                    cursor.execute(
                        "INSERT INTO doctor_logs (doctor_login, action, details) VALUES (%s, %s, %s)",
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
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute(
                    "INSERT INTO complaints (name, email, phone, message, status) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at",
                    (name, email, phone, message, 'new')
                )
                result = cursor.fetchone()
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
            cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC LIMIT 100")
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
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()