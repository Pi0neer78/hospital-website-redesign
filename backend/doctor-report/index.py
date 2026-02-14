import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event, context):
    """Формирование отчёта по врачам: слоты, обслуживание, отмены, нарушения за период."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
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

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': 'No DB'})}

    params = event.get('queryStringParameters') or {}
    date_from = params.get('date_from', '')
    date_to = params.get('date_to', '')

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            date_filter = ""
            if date_from and date_to:
                date_filter = "AND a.appointment_date BETWEEN '%s' AND '%s'" % (date_from, date_to)
            elif date_from:
                date_filter = "AND a.appointment_date >= '%s'" % date_from
            elif date_to:
                date_filter = "AND a.appointment_date <= '%s'" % date_to

            log_date_filter = ""
            if date_from and date_to:
                log_date_filter = "AND dl.created_at::date BETWEEN '%s' AND '%s'" % (date_from, date_to)
            elif date_from:
                log_date_filter = "AND dl.created_at::date >= '%s'" % date_from
            elif date_to:
                log_date_filter = "AND dl.created_at::date <= '%s'" % date_to

            cur.execute("""
                SELECT
                    d.id,
                    d.full_name,
                    d.position,
                    d.phone,
                    COALESCE(slots.scheduled, 0) AS scheduled,
                    COALESCE(slots.completed, 0) AS completed,
                    COALESCE(slots.cancelled, 0) AS cancelled,
                    COALESCE(logs.violations, 0) AS violations
                FROM doctors d
                LEFT JOIN (
                    SELECT
                        a.doctor_id,
                        COUNT(*) FILTER (WHERE a.status = 'scheduled') AS scheduled,
                        COUNT(*) FILTER (WHERE a.status = 'completed') AS completed,
                        COUNT(*) FILTER (WHERE a.status = 'cancelled') AS cancelled
                    FROM appointments_v2 a
                    WHERE 1=1 %s
                    GROUP BY a.doctor_id
                ) slots ON slots.doctor_id = d.id
                LEFT JOIN (
                    SELECT
                        dl.doctor_id,
                        COUNT(*) AS violations
                    FROM doctor_logs dl
                    WHERE dl.action_type IN ('Отмена записи', 'Перенос записи') %s
                    GROUP BY dl.doctor_id
                ) logs ON logs.doctor_id = d.id
                WHERE d.is_active = true
                ORDER BY d.full_name
            """ % (date_filter, log_date_filter))

            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append({
                    'id': r['id'],
                    'full_name': r['full_name'],
                    'position': r['position'],
                    'phone': r['phone'] or '',
                    'scheduled': r['scheduled'],
                    'completed': r['completed'],
                    'cancelled': r['cancelled'],
                    'violations': r['violations']
                })

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'report': result}, ensure_ascii=False, default=str)
            }
    finally:
        conn.close()
