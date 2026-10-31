import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta
import random
import urllib.request
import urllib.parse
import smtplib
from email.mime.text import MIMEText

def check_rate_limit(conn, ip_address: str, phone_number: str) -> tuple:
    """Проверка rate limit для SMS"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(
        "SELECT COUNT(*) as count FROM t_p30358746_hospital_website_red.rate_limit_logs WHERE ip_address = %s AND endpoint = 'sms-verify' AND created_at > NOW() - INTERVAL '1 minute'",
        (ip_address,)
    )
    result = cursor.fetchone()
    if result and result['count'] >= 5:
        cursor.close()
        return False, 'Превышен лимит: более 5 SMS запросов в минуту'
    
    cursor.execute(
        "SELECT COUNT(*) as count FROM t_p30358746_hospital_website_red.rate_limit_logs WHERE endpoint = 'sms-verify' AND fingerprint = %s AND created_at > NOW() - INTERVAL '1 hour'",
        (phone_number,)
    )
    result = cursor.fetchone()
    if result and result['count'] >= 3:
        cursor.close()
        return False, 'Превышен лимит: более 3 SMS на один номер в час'
    
    cursor.close()
    return True, None

def record_request(conn, ip_address: str, phone_number: str):
    """Записать запрос"""
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO t_p30358746_hospital_website_red.rate_limit_logs (ip_address, endpoint, fingerprint) VALUES (%s, 'sms-verify', %s)",
        (ip_address, phone_number)
    )
    conn.commit()
    cursor.close()

ALERT_EMAIL = 'andrew_korobko@mail.ru'
DIGEST_INTERVAL_MINUTES = 10
FAILURES_TABLE = 't_p30358746_hospital_website_red.max_send_failures'


def mask_phone(phone: str) -> str:
    return phone[:4] + '***' + phone[-3:] if len(phone) > 7 else '***'


def hide_secrets(text: str) -> str:
    for secret in (os.environ.get('GREEN_API_TOKEN'), os.environ.get('GREEN_API_INSTANCE_ID'), os.environ.get('SMTP_PASSWORD')):
        if secret:
            text = text.replace(secret, '***')
    return text


def record_failure(conn, context_obj, phone: str, problem: str, details: str):
    """Сохранить сбой отправки кода в MAX и отправить сводку, если пора"""
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {FAILURES_TABLE} (phone_masked, problem, details, request_id) VALUES (%s, %s, %s, %s)",
            (mask_phone(phone), problem[:500], hide_secrets(details)[:2000], str(getattr(context_obj, 'request_id', '-')))
        )
        conn.commit()
        cur.close()
    except Exception as db_error:
        conn.rollback()
        print(f'ALERT: не удалось сохранить сбой: {type(db_error).__name__}')
        return
    flush_failure_digest(conn)


def flush_failure_digest(conn):
    """Отправить одно письмо со всеми накопленными сбоями, не чаще раза в 10 минут"""
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    if not smtp_user or not smtp_password:
        return
    cur = conn.cursor(cursor_factory=RealDictCursor)
    claimed_ids = []
    try:
        cur.execute(
            f"UPDATE {FAILURES_TABLE} SET emailed_at = NOW() "
            f"WHERE emailed_at IS NULL "
            f"AND NOT EXISTS (SELECT 1 FROM {FAILURES_TABLE} WHERE emailed_at > NOW() - INTERVAL '{DIGEST_INTERVAL_MINUTES} minutes') "
            f"RETURNING id, created_at, phone_masked, problem, details, request_id"
        )
        rows = sorted(cur.fetchall(), key=lambda r: r['created_at'])[:100]
        conn.commit()
        if not rows:
            return
        claimed_ids = [int(r['id']) for r in rows]

        lines = [
            f"Не удалось отправить код подтверждения в MAX. Сбоев: {len(rows)}.",
            f"Период: {rows[0]['created_at'].strftime('%d.%m.%Y %H:%M:%S')} - {rows[-1]['created_at'].strftime('%d.%m.%Y %H:%M:%S')} (серверное время).",
            "Пациентам в этих случаях код был показан на экране.",
            "",
        ]
        for i, r in enumerate(rows, 1):
            lines.append(f"{i}. {r['created_at'].strftime('%H:%M:%S')} | номер {r['phone_masked']} | {r['problem']}")
            lines.append(f"   Подробности: {r['details']}")
            lines.append(f"   ID запроса: {r['request_id']}")
            lines.append("")

        msg = MIMEText("\n".join(lines), 'plain', 'utf-8')
        msg['From'] = os.environ.get('FROM_EMAIL', smtp_user)
        msg['To'] = ALERT_EMAIL
        msg['Subject'] = f'Ошибки отправки кодов в MAX: {len(rows)}'

        with smtplib.SMTP(os.environ.get('SMTP_SERVER', 'smtp.gmail.com'), int(os.environ.get('SMTP_PORT', '587')), timeout=2) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        print(f'ALERT: сводка отправлена, сбоев: {len(rows)}')
    except Exception as mail_error:
        print(f'ALERT: сводка не отправлена: {type(mail_error).__name__}')
        try:
            conn.rollback()
            if claimed_ids:
                ids = ','.join(str(i) for i in claimed_ids)
                cur.execute(f"UPDATE {FAILURES_TABLE} SET emailed_at = NULL WHERE id IN ({ids})")
                conn.commit()
        except Exception:
            conn.rollback()
    finally:
        cur.close()


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
    
    ip_address = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
    
    try:
        if action in ('send', 'verify'):
            flush_failure_digest(conn)

        if action == 'send':
            phone_number = body.get('phone_number', '').strip()
            
            allowed, reason = check_rate_limit(conn, ip_address, phone_number)
            if not allowed:
                return {
                    'statusCode': 429,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': reason}),
                    'isBase64Encoded': False
                }
            
            record_request(conn, ip_address, phone_number)
            
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
            
            message_text = f"Ваш код подтверждения: {code}\n\nКод действителен 10 минут."
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
                base_url = f'https://{green_api_instance_id[:4]}.api.green-api.com/v3/waInstance{green_api_instance_id}'
                chat_id = f"{clean_phone}@c.us"
                
                request_data = json.dumps({
                    'chatId': chat_id,
                    'message': message_text
                }).encode('utf-8')
                
                url = f'{base_url}/sendMessage/{green_api_token}'
                
                print(f"DEBUG: ChatId: {chat_id}")
            
                req = urllib.request.Request(
                    url,
                    data=request_data,
                    headers={
                        'Content-Type': 'application/json'
                    },
                    method='POST'
                )
                
                with urllib.request.urlopen(req, timeout=3) as response:
                    result = json.loads(response.read().decode('utf-8'))
                    print(f"DEBUG: GREEN-API Response: {result}")
                    message_sent = True

                try:
                    with urllib.request.urlopen(f'{base_url}/getStateInstance/{green_api_token}', timeout=1.5) as state_resp:
                        state = json.loads(state_resp.read().decode('utf-8')).get('stateInstance')
                    if state != 'authorized':
                        message_sent = False
                        show_code_on_screen = True
                        print(f"DEBUG: аккаунт GREEN-API в состоянии {state}")
                        record_failure(conn, context, clean_phone, f'аккаунт GREEN-API не авторизован (состояние: {state})', f'GREEN-API принял сообщение, но не может его доставить. Ответ на отправку: {result}')
                except Exception as state_error:
                    print(f"DEBUG: getStateInstance недоступен: {type(state_error).__name__}")
                    
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8')
                print(f"DEBUG: HTTP Error {e.code}: {error_body}")
                
                show_code_on_screen = True
                print(f"Не удалось отправить через GREEN-API, показываем код на экране")
                record_failure(conn, context, clean_phone, f'GREEN-API вернул ошибку HTTP {e.code}', error_body)
                
            except Exception as e:
                print(f"DEBUG: Exception: {type(e).__name__}: {str(e)}")
                show_code_on_screen = True
                print(f"Ошибка отправки через GREEN-API, показываем код на экране")
                record_failure(conn, context, clean_phone, f'сбой при обращении к GREEN-API ({type(e).__name__})', str(e))
            
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