import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta
import random
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Верификация номера телефона через GREEN-API (мессенджер MAX)
    POST /send - отправить код на телефон
    POST /verify - проверить введенный код
    """
    method = event.get('httpMethod', 'POST')
    
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
    
    conn = psycopg2.connect(database_url)
    body = json.loads(event.get('body', '{}'))
    action = body.get('action', 'send')
    
    try:
        if action == 'send':
            phone_number = body.get('phone_number', '').strip()
            
            if not phone_number:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone number is required'}),
                    'isBase64Encoded': False
                }
            
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            
            if len(clean_phone) < 10:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid phone number format'}),
                    'isBase64Encoded': False
                }
            
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            expires_at = datetime.now() + timedelta(minutes=10)
            
            green_api_instance_id = os.environ.get('GREEN_API_INSTANCE_ID')
            green_api_token = os.environ.get('GREEN_API_TOKEN')
            
            if not green_api_instance_id or not green_api_token:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'GREEN-API credentials not configured'}),
                    'isBase64Encoded': False
                }
            
            message_text = f"Ваш код подтверждения для записи на прием: {code}\n\nКод действителен 10 минут."
            message_sent = False
            show_code_on_screen = False
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "DELETE FROM t_p30358746_hospital_website_red.sms_verification_codes WHERE expires_at < NOW()"
            )
            
            cursor.execute(
                "SELECT daily_send_count, last_daily_reset FROM t_p30358746_hospital_website_red.sms_verification_codes WHERE phone_number = %s",
                (clean_phone,)
            )
            existing_record = cursor.fetchone()
            
            if existing_record:
                today = datetime.now().date()
                last_reset = existing_record['last_daily_reset']
                
                if last_reset == today:
                    if existing_record['daily_send_count'] >= 3:
                        cursor.close()
                        return {
                            'statusCode': 429,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Превышен лимит отправки на сегодня (максимум 3). Попробуйте завтра.'}),
                            'isBase64Encoded': False
                        }
            
            try:
                chat_id = f"{clean_phone}@c.us"
                
                request_data = json.dumps({
                    'chatId': chat_id,
                    'message': message_text
                }).encode('utf-8')
                
                url = f'https://api.green-api.com/waInstance{green_api_instance_id}/sendMessage/{green_api_token}'
                
                print(f"DEBUG: Sending to GREEN-API: {url}")
                print(f"DEBUG: ChatId: {chat_id}")
                print(f"DEBUG: Message: {message_text}")
            
                req = urllib.request.Request(
                    url,
                    data=request_data,
                    headers={
                        'Content-Type': 'application/json'
                    },
                    method='POST'
                )
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    print(f"DEBUG: GREEN-API Response: {result}")
                    message_sent = True
                    
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                print(f"DEBUG: HTTP Error {e.code}: {error_body}")
                
                show_code_on_screen = True
                print(f"Не удалось отправить через GREEN-API, показываем код на экране")
                
            except Exception as e:
                print(f"DEBUG: Exception: {type(e).__name__}: {str(e)}")
                show_code_on_screen = True
                print(f"Ошибка отправки через GREEN-API, показываем код на экране")
            
            if existing_record:
                today = datetime.now().date()
                last_reset = existing_record['last_daily_reset']
                
                if last_reset == today:
                    cursor.execute(
                        "UPDATE t_p30358746_hospital_website_red.sms_verification_codes SET code = %s, expires_at = %s, verified = false, attempts = 0, daily_send_count = daily_send_count + 1 WHERE phone_number = %s",
                        (code, expires_at, clean_phone)
                    )
                else:
                    cursor.execute(
                        "UPDATE t_p30358746_hospital_website_red.sms_verification_codes SET code = %s, expires_at = %s, verified = false, attempts = 0, daily_send_count = 1, last_daily_reset = %s WHERE phone_number = %s",
                        (code, expires_at, today, clean_phone)
                    )
            else:
                cursor.execute(
                    "INSERT INTO t_p30358746_hospital_website_red.sms_verification_codes (phone_number, code, expires_at, verified, attempts, daily_send_count, last_daily_reset) VALUES (%s, %s, %s, false, 0, 1, %s)",
                    (clean_phone, code, expires_at, datetime.now().date())
                )
            
            conn.commit()
            cursor.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Код отправлен в MAX' if message_sent else 'Код создан',
                    'show_code': code if show_code_on_screen else None,
                    'sent_via_max': message_sent
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'verify':
            phone_number = body.get('phone_number', '').strip()
            code_input = body.get('code', '').strip()
            
            if not phone_number or not code_input:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone number and code are required'}),
                    'isBase64Encoded': False
                }
            
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                "SELECT code, expires_at, verified, attempts FROM t_p30358746_hospital_website_red.sms_verification_codes WHERE phone_number = %s",
                (clean_phone,)
            )
            verification_record = cursor.fetchone()
            
            if not verification_record:
                cursor.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Код не найден. Запросите новый код.'}),
                    'isBase64Encoded': False
                }
            
            if verification_record['verified']:
                cursor.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Код уже использован'}),
                    'isBase64Encoded': False
                }
            
            if datetime.now() > verification_record['expires_at']:
                cursor.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Код истёк. Запросите новый.'}),
                    'isBase64Encoded': False
                }
            
            if verification_record['attempts'] >= 5:
                cursor.close()
                return {
                    'statusCode': 429,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Превышено количество попыток. Запросите новый код.'}),
                    'isBase64Encoded': False
                }
            
            if verification_record['code'] == code_input:
                cursor.execute(
                    "UPDATE t_p30358746_hospital_website_red.sms_verification_codes SET verified = true WHERE phone_number = %s",
                    (clean_phone,)
                )
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Телефон успешно подтвержден',
                        'phone_number': clean_phone
                    }),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(
                    "UPDATE t_p30358746_hospital_website_red.sms_verification_codes SET attempts = attempts + 1 WHERE phone_number = %s",
                    (clean_phone,)
                )
                conn.commit()
                
                remaining_attempts = 5 - (verification_record['attempts'] + 1)
                cursor.close()
                
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': f'Неверный код. Осталось попыток: {remaining_attempts}',
                        'remaining_attempts': remaining_attempts
                    }),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action. Use "send" or "verify"'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Server error: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()
