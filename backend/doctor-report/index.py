import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event, context):
    """Формирование отчёта по врачам: слоты из расписания, записи, обслуживание, отмены, нарушения (>5 мин)."""
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

    appt_date_filter = ""
    sched_date_filter = ""
    if date_from and date_to:
        appt_date_filter = "AND a.appointment_date BETWEEN '%s' AND '%s'" % (date_from, date_to)
        sched_date_filter = "AND ds.schedule_date BETWEEN '%s' AND '%s'" % (date_from, date_to)
    elif date_from:
        appt_date_filter = "AND a.appointment_date >= '%s'" % date_from
        sched_date_filter = "AND ds.schedule_date >= '%s'" % date_from
    elif date_to:
        appt_date_filter = "AND a.appointment_date <= '%s'" % date_to
        sched_date_filter = "AND ds.schedule_date <= '%s'" % date_to

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    d.id,
                    d.full_name,
                    d.position,
                    d.phone,
                    d.clinic,
                    COALESCE(sched.total_slots, 0) AS scheduled,
                    COALESCE(appt.booked, 0) AS booked,
                    COALESCE(appt.completed, 0) AS completed,
                    COALESCE(appt.cancelled, 0) AS cancelled,
                    COALESCE(viol.violations, 0) AS violations
                FROM doctors d
                LEFT JOIN (
                    SELECT
                        ds.doctor_id,
                        SUM(
                            FLOOR(
                                (
                                    EXTRACT(EPOCH FROM (ds.end_time - ds.start_time))
                                    - COALESCE(EXTRACT(EPOCH FROM (ds.break_end_time - ds.break_start_time)), 0)
                                ) / (ds.slot_duration * 60)
                            )
                        )::int AS total_slots
                    FROM daily_schedules ds
                    WHERE ds.is_active = true %s
                    GROUP BY ds.doctor_id
                ) sched ON sched.doctor_id = d.id
                LEFT JOIN (
                    SELECT
                        a.doctor_id,
                        COUNT(*) AS booked,
                        COUNT(*) FILTER (WHERE a.status = 'completed') AS completed,
                        COUNT(*) FILTER (WHERE a.status = 'cancelled') AS cancelled
                    FROM appointments_v2 a
                    WHERE 1=1 %s
                    GROUP BY a.doctor_id
                ) appt ON appt.doctor_id = d.id
                LEFT JOIN (
                    SELECT
                        a.doctor_id,
                        COUNT(*) AS violations
                    FROM appointments_v2 a
                    JOIN daily_schedules ds2
                        ON ds2.doctor_id = a.doctor_id AND ds2.schedule_date = a.appointment_date
                    WHERE a.status = 'completed'
                        AND a.completed_at IS NOT NULL
                        AND (a.completed_at::time - (a.appointment_time + (ds2.slot_duration || ' minutes')::interval)) > interval '5 minutes'
                        %s
                    GROUP BY a.doctor_id
                ) viol ON viol.doctor_id = d.id
                WHERE d.is_active = true
                ORDER BY d.clinic, d.full_name
            """ % (sched_date_filter, appt_date_filter, appt_date_filter))

            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append({
                    'id': r['id'],
                    'full_name': r['full_name'],
                    'position': r['position'],
                    'phone': r['phone'] or '',
                    'clinic': r['clinic'] or 'Не указано',
                    'scheduled': r['scheduled'],
                    'booked': r['booked'],
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
