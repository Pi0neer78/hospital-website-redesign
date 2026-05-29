"""
Киоск самозаписи: создание записи к врачу с генерацией уникального кода для отмены.
"""
import json
import os
import random
import string
import psycopg2
from datetime import datetime, timezone, timedelta

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p30358746_hospital_website_red')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def generate_code():
    return ''.join(random.choices(string.digits, k=10))


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'POST' and action == 'create':
        body = json.loads(event.get('body') or '{}')
        doctor_id = body.get('doctor_id')
        patient_name = body.get('patient_name', '').strip()
        patient_phone = body.get('patient_phone', '').strip()
        patient_snils = body.get('patient_snils', '').strip()
        patient_oms = body.get('patient_oms', '').strip()
        appointment_date = body.get('appointment_date')
        appointment_time = body.get('appointment_time')
        description = body.get('description', '').strip()

        if not all([doctor_id, patient_name, patient_phone, appointment_date, appointment_time]):
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не заполнены обязательные поля'}),
            }

        conn = get_db()
        cur = conn.cursor()

        cur.execute(f'''
            SELECT COUNT(*) FROM "{SCHEMA}".appointments_v2
            WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s
            AND status NOT IN (\'cancelled\')
        ''', (doctor_id, appointment_date, appointment_time))
        count = cur.fetchone()[0]
        if count > 0:
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Выбранное время уже занято'}),
            }

        cur.execute(f'''
            INSERT INTO "{SCHEMA}".appointments_v2
            (doctor_id, patient_name, patient_phone, patient_snils, patient_oms,
             appointment_date, appointment_time, description, status, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'scheduled', 4)
            RETURNING id, created_at
        ''', (doctor_id, patient_name, patient_phone, patient_snils, patient_oms,
              appointment_date, appointment_time, description))
        row = cur.fetchone()
        appointment_id = row[0]
        created_at = row[1]

        code = generate_code()
        cur.execute(f'''
            INSERT INTO "{SCHEMA}".id_codes (appointment_id, code)
            VALUES (%s, %s)
        ''', (appointment_id, code))

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'appointment_id': appointment_id,
                'code': code,
                'created_at': created_at.isoformat(),
            }),
        }

    if method == 'POST' and action == 'cancel':
        body = json.loads(event.get('body') or '{}')
        code = body.get('code', '').strip()

        if not code or len(code) != 10:
            return {
                'statusCode': 400,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Введите корректный 10-значный код'}),
            }

        conn = get_db()
        cur = conn.cursor()
        cur.execute(f'''
            SELECT ic.appointment_id, a.status, a.appointment_date, a.appointment_time,
                   a.patient_name, d.full_name
            FROM "{SCHEMA}".id_codes ic
            JOIN "{SCHEMA}".appointments_v2 a ON a.id = ic.appointment_id
            JOIN "{SCHEMA}".doctors d ON d.id = a.doctor_id
            WHERE ic.code = %s
        ''', (code,))
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Запись с таким кодом не найдена'}),
            }

        appointment_id, status, apt_date, apt_time, patient_name, doctor_name = row

        if status == 'cancelled':
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Запись уже отменена'}),
            }

        cur.execute(f'''
            UPDATE "{SCHEMA}".appointments_v2 SET status = 'cancelled' WHERE id = %s
        ''', (appointment_id,))
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'appointment_id': appointment_id,
                'doctor_name': doctor_name,
                'appointment_date': str(apt_date),
                'appointment_time': str(apt_time)[:5],
                'patient_name': patient_name,
            }),
        }

    return {
        'statusCode': 404,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Not found'}),
    }
