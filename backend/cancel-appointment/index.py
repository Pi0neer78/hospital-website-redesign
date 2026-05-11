import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import urllib.request

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30358746_hospital_website_red')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def send_max_message(phone: str, message: str):
    """Отправить сообщение в MAX через GREEN-API"""
    instance_id = os.environ.get('GREEN_API_INSTANCE_ID')
    token = os.environ.get('GREEN_API_TOKEN')
    if not instance_id or not token:
        return
    clean_phone = ''.join(filter(str.isdigit, phone))
    chat_id = f"{clean_phone}@c.us"
    data = json.dumps({'chatId': chat_id, 'message': message}).encode('utf-8')
    url = f'https://api.green-api.com/v3/waInstance{instance_id}/sendMessage/{token}'
    try:
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"MAX send error: {e}")

def fmt_date(d) -> str:
    if not d:
        return '—'
    s = str(d)
    if len(s) == 10:
        y, m, day = s.split('-')
        return f"{day}.{m}.{y}"
    return s

def fmt_time(t) -> str:
    if not t:
        return '—'
    return str(t)[:5]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление записями пациента
    POST notify — отправить уведомление об успешной записи в MAX
    POST get-appointments — получить активные записи по телефону (после верификации)
    POST cancel — отменить запись по id и телефону + уведомление в MAX
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    if action == 'notify':
        phone = ''.join(filter(str.isdigit, body.get('phone', '')))
        patient_name = body.get('patient_name', '')
        doctor_name = body.get('doctor_name', '')
        doctor_specialty = body.get('doctor_specialty', '')
        date = body.get('date', '')
        time = body.get('time', '')
        description = body.get('description', '')

        if not phone:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', **CORS},
                'body': json.dumps({'error': 'Номер телефона обязателен'})
            }

        conn.close()

        date_fmt = fmt_date(date)
        msg = (
            f"✅ Вы успешно записаны на приём!\n\n"
            f"📅 Дата: {date_fmt}\n"
            f"🕐 Время: {time}\n"
            f"👨‍⚕️ Врач: {doctor_name}"
            + (f" ({doctor_specialty})" if doctor_specialty else "") +
            f"\n👤 Пациент: {patient_name}"
            + (f"\n📋 Описание: {description}" if description else "") +
            f"\n\nДо встречи! Пожалуйста, не опаздывайте."
        )
        send_max_message(phone, msg)

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', **CORS},
            'body': json.dumps({'success': True})
        }

    if action == 'get-appointments':
        phone = ''.join(filter(str.isdigit, body.get('phone', '')))
        if not phone:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', **CORS},
                'body': json.dumps({'error': 'Номер телефона обязателен'})
            }

        cursor.execute(f"""
            SELECT
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.patient_name,
                a.patient_phone,
                a.description,
                d.full_name AS doctor_name,
                d.specialization AS doctor_specialty
            FROM {SCHEMA}.appointments_v2 a
            LEFT JOIN {SCHEMA}.doctors d ON d.id = a.doctor_id
            WHERE a.patient_phone LIKE %s
              AND a.status = 'scheduled'
              AND a.appointment_date >= CURRENT_DATE
            ORDER BY a.appointment_date, a.appointment_time
        """, (f'%{phone[-10:]}%',))

        rows = cursor.fetchall()
        conn.close()

        appointments = []
        for r in rows:
            appointments.append({
                'id': r['id'],
                'date': str(r['appointment_date']),
                'time': fmt_time(r['appointment_time']),
                'patient_name': r['patient_name'] or '',
                'doctor_name': r['doctor_name'] or '—',
                'doctor_specialty': r['doctor_specialty'] or '',
                'description': r['description'] or '',
            })

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', **CORS},
            'body': json.dumps({'success': True, 'appointments': appointments})
        }

    if action == 'cancel':
        appointment_id = body.get('appointment_id')
        phone = ''.join(filter(str.isdigit, body.get('phone', '')))

        if not appointment_id or not phone:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', **CORS},
                'body': json.dumps({'error': 'Не указан ID записи или телефон'})
            }

        cursor.execute(f"""
            SELECT
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.patient_name,
                a.patient_phone,
                a.description,
                d.full_name AS doctor_name,
                d.specialization AS doctor_specialty
            FROM {SCHEMA}.appointments_v2 a
            LEFT JOIN {SCHEMA}.doctors d ON d.id = a.doctor_id
            WHERE a.id = %s
              AND a.patient_phone LIKE %s
              AND a.status = 'scheduled'
        """, (appointment_id, f'%{phone[-10:]}%'))

        appt = cursor.fetchone()

        if not appt:
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', **CORS},
                'body': json.dumps({'error': 'Запись не найдена или уже отменена'})
            }

        cursor.execute(f"""
            UPDATE {SCHEMA}.appointments_v2
            SET status = 'cancelled'
            WHERE id = %s
        """, (appointment_id,))
        conn.commit()
        conn.close()

        date_fmt = fmt_date(appt['appointment_date'])
        time_fmt = fmt_time(appt['appointment_time'])
        doctor = appt['doctor_name'] or '—'
        specialty = appt['doctor_specialty'] or ''
        patient = appt['patient_name'] or ''

        msg = (
            f"❌ Ваша запись отменена\n\n"
            f"📅 Дата: {date_fmt}\n"
            f"🕐 Время: {time_fmt}\n"
            f"👨‍⚕️ Врач: {doctor}"
            + (f" ({specialty})" if specialty else "") +
            f"\n👤 Пациент: {patient}\n\n"
            f"Если хотите записаться снова — посетите наш сайт."
        )
        send_max_message(appt['patient_phone'], msg)

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', **CORS},
            'body': json.dumps({
                'success': True,
                'appointment': {
                    'id': appt['id'],
                    'date': str(appt['appointment_date']),
                    'time': time_fmt,
                    'doctor_name': doctor,
                    'doctor_specialty': specialty,
                    'patient_name': patient,
                    'description': appt['description'] or '',
                }
            })
        }

    conn.close()
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', **CORS},
        'body': json.dumps({'error': 'Неизвестное действие'})
    }