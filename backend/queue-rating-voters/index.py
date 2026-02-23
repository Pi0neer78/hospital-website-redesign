import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event, context):
    """Получение списка голосовавших за указанный период"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False)
        }

    params = event.get('queryStringParameters') or {}
    period = params.get('period', 'all')

    now = datetime.now()
    period_map = {
        'day': now - timedelta(days=1),
        'week': now - timedelta(days=7),
        'month': now - timedelta(days=30),
        'year': datetime(now.year, 1, 1),
        'all': datetime(2000, 1, 1)
    }

    start_date = period_map.get(period, datetime(2000, 1, 1))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("""
        SELECT
            qr.id,
            qr.patient_name,
            qr.rating,
            qr.created_at,
            qr.appointment_id,
            a.patient_phone,
            a.appointment_date,
            a.appointment_time,
            d.full_name AS doctor_name
        FROM t_p30358746_hospital_website_red.queue_ratings qr
        LEFT JOIN t_p30358746_hospital_website_red.appointments_v2 a
            ON a.id = qr.appointment_id
        LEFT JOIN t_p30358746_hospital_website_red.doctors d
            ON d.id = a.doctor_id
        WHERE qr.created_at >= %s AND qr.created_at <= %s
        ORDER BY qr.created_at DESC
    """, (start_date, now))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    voters = []
    for row in rows:
        voters.append({
            'id': row[0],
            'patient_name': row[1] or '',
            'rating': row[2],
            'voted_at': row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else '',
            'appointment_id': row[4],
            'patient_phone': row[5] or '',
            'appointment_date': row[6].strftime('%Y-%m-%d') if row[6] else '',
            'appointment_time': str(row[7])[:5] if row[7] else '',
            'doctor_name': row[8] or ''
        })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'voters': voters}, ensure_ascii=False)
    }
