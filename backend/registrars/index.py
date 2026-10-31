import json
import hashlib
import os
import psycopg2
from datetime import datetime

def is_admin(event, conn) -> bool:
    """Проверить временный токен администратора из заголовка X-Admin-Token"""
    headers = event.get('headers') or {}
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token') or ''
    if not token:
        return False
    cur = conn.cursor()
    try:
        cur.execute(
            """SELECT 1 FROM t_p30358746_hospital_website_red.admin_sessions s
               JOIN t_p30358746_hospital_website_red.admins a ON a.id = s.admin_id
               WHERE s.token_hash = %s AND s.expires_at > NOW() AND a.is_active = true""",
            (hashlib.sha256(token.encode('utf-8')).hexdigest(),)
        )
        return cur.fetchone() is not None
    finally:
        cur.close()


def unauthorized():
    return {
        'statusCode': 401,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Требуется вход администратора'}, ensure_ascii=False),
        'isBase64Encoded': False
    }


def handler(event: dict, context) -> dict:
    '''API для управления регистраторами и журналом их действий'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        is_log_write = method == 'POST' and json.loads(event.get('body') or '{}').get('action') == 'log'
        if not is_log_write and not is_admin(event, conn):
            return unauthorized()

        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'list')
            
            if action == 'list':
                cur.execute('''
                    SELECT id, full_name, phone, login, clinic, is_blocked, created_at
                    FROM registrars
                    ORDER BY created_at DESC
                ''')
                registrars = []
                for row in cur.fetchall():
                    registrars.append({
                        'id': row[0],
                        'full_name': row[1],
                        'phone': row[2],
                        'login': row[3],
                        'clinic': row[4],
                        'is_blocked': row[5],
                        'created_at': row[6].isoformat() if row[6] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'registrars': registrars})
                }
            
            elif action == 'logs':
                registrar_id = event.get('queryStringParameters', {}).get('registrar_id')
                limit = int(event.get('queryStringParameters', {}).get('limit', 100))
                
                if registrar_id:
                    cur.execute('''
                        SELECT id, registrar_id, user_login, action_type, details, ip_address, computer_name, created_at
                        FROM registrar_logs
                        WHERE registrar_id = %s
                        ORDER BY created_at DESC
                        LIMIT %s
                    ''', (registrar_id, limit))
                else:
                    cur.execute('''
                        SELECT rl.id, rl.registrar_id, rl.user_login, rl.action_type, rl.details, rl.ip_address, 
                               rl.computer_name, rl.created_at, r.full_name
                        FROM registrar_logs rl
                        LEFT JOIN registrars r ON rl.registrar_id = r.id
                        ORDER BY rl.created_at DESC
                        LIMIT %s
                    ''', (limit,))
                
                logs = []
                for row in cur.fetchall():
                    log_entry = {
                        'id': row[0],
                        'registrar_id': row[1],
                        'user_login': row[2],
                        'action_type': row[3],
                        'details': row[4],
                        'ip_address': row[5],
                        'computer_name': row[6],
                        'created_at': row[7].isoformat() if row[7] else None
                    }
                    if len(row) > 8:
                        log_entry['registrar_name'] = row[8]
                    logs.append(log_entry)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'logs': logs})
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            action = data.get('action', 'create')
            
            if action == 'create':
                cur.execute('''
                    INSERT INTO registrars (full_name, phone, login, password, clinic)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    data['full_name'],
                    data['phone'],
                    data['login'],
                    data['password'],
                    data['clinic']
                ))
                registrar_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': registrar_id})
                }
            
            elif action == 'log':
                # Получение реального IP-адреса из заголовков
                headers = event.get('headers', {})
                ip_address = (
                    headers.get('X-Forwarded-For', '').split(',')[0].strip() or
                    headers.get('X-Real-IP', '') or
                    headers.get('CF-Connecting-IP', '') or
                    event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
                )
                
                cur.execute('''
                    INSERT INTO registrar_logs (registrar_id, user_login, action_type, details, ip_address, computer_name)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    data['registrar_id'],
                    data.get('user_login'),
                    data['action_type'],
                    data.get('details'),
                    ip_address,
                    data.get('computer_name')
                ))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            registrar_id = data['id']
            
            update_fields = []
            update_values = []
            
            if 'full_name' in data:
                update_fields.append('full_name = %s')
                update_values.append(data['full_name'])
            if 'phone' in data:
                update_fields.append('phone = %s')
                update_values.append(data['phone'])
            if 'login' in data:
                update_fields.append('login = %s')
                update_values.append(data['login'])
            if 'password' in data:
                update_fields.append('password = %s')
                update_values.append(data['password'])
            if 'clinic' in data:
                update_fields.append('clinic = %s')
                update_values.append(data['clinic'])
            if 'is_blocked' in data:
                update_fields.append('is_blocked = %s')
                update_values.append(data['is_blocked'])
            
            update_values.append(registrar_id)
            
            cur.execute(f'''
                UPDATE registrars
                SET {', '.join(update_fields)}
                WHERE id = %s
            ''', update_values)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            data = json.loads(event.get('body', '{}'))
            registrar_id = data['id']
            
            cur.execute('DELETE FROM registrars WHERE id = %s', (registrar_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': False, 'error': 'Method not allowed'})
    }