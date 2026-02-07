import json
import os
import psycopg2
import bcrypt
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Аутентификация пользователей
    POST /login - вход (admin, doctor, registrar)
    POST /login_admin - специальный вход для главного врача
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'login')
        login = body.get('login')
        password = body.get('password')
        user_type = body.get('type', 'admin')
        
        if not login or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Login and password are required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'login_admin':
                cursor.execute(
                    "SELECT id, login, full_name, password_hash FROM admins WHERE login = %s AND is_active = true",
                    (login,)
                )
                user = cursor.fetchone()
                
                if user:
                    try:
                        password_match = bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))
                    except:
                        password_match = False
                    
                    if password_match:
                        cursor.execute(
                            "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = %s",
                            (user['id'],)
                        )
                        conn.commit()
                        cursor.close()
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({
                                'success': True,
                                'token': f"mdoctor_{user['id']}",
                                'user': {'id': user['id'], 'login': user['login'], 'full_name': user['full_name']},
                                'message': 'Вход выполнен успешно'
                            }),
                            'isBase64Encoded': False
                        }
            
            elif user_type == 'admin':
                cursor.execute(
                    "SELECT id, login, full_name, password_hash FROM admins WHERE login = %s",
                    (login,)
                )
                user = cursor.fetchone()
                
                if user:
                    # Проверка пароля через bcrypt
                    try:
                        password_match = bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8'))
                    except:
                        password_match = False
                    
                    if password_match:
                        cursor.close()
                        return {
                            'statusCode': 200,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({
                                'success': True,
                                'user': {'id': user['id'], 'login': user['login'], 'full_name': user['full_name']},
                                'type': 'admin'
                            }),
                            'isBase64Encoded': False
                        }
            
            elif user_type == 'doctor':
                cursor.execute(
                    "SELECT id, login, full_name, phone, position, specialization FROM doctors WHERE login = %s AND password_hash = %s AND is_active = true",
                    (login, password)
                )
                user = cursor.fetchone()
                
                if user:
                    cursor.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'user': dict(user),
                            'type': 'doctor'
                        }),
                        'isBase64Encoded': False
                    }
            
            elif user_type == 'registrar':
                cursor.execute(
                    "SELECT id, login, full_name, phone, clinic FROM registrars WHERE login = %s AND password = %s AND is_blocked = false",
                    (login, password)
                )
                user = cursor.fetchone()
                
                if user:
                    cursor.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'user': dict(user),
                            'type': 'registrar'
                        }),
                        'isBase64Encoded': False
                    }
            
            cursor.close()
            
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неправильный логин или пароль'}),
                'isBase64Encoded': False
            }
        
        finally:
            conn.close()
    
    else:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }