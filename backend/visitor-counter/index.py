import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p30358746_hospital_website_red'

def handler(event: dict, context) -> dict:
    """Счётчик посещений главной страницы. GET — получить статистику, POST — зафиксировать визит."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': 'Database configuration missing'})}

    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    method = event.get('httpMethod', 'GET')

    if method == 'POST':
        cursor.execute(f"""
            INSERT INTO {SCHEMA}.visitor_counter (visit_date, count)
            VALUES (CURRENT_DATE, 1)
            ON CONFLICT (visit_date) DO UPDATE SET count = {SCHEMA}.visitor_counter.count + 1
            RETURNING count
        """)
        conn.commit()

    cursor.execute(f"SELECT SUM(count) as total FROM {SCHEMA}.visitor_counter")
    total_row = cursor.fetchone()
    total = int(total_row['total'] or 0)

    cursor.execute(f"SELECT count FROM {SCHEMA}.visitor_counter WHERE visit_date = CURRENT_DATE")
    today_row = cursor.fetchone()
    today = int(today_row['count'] if today_row else 0)

    cursor.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'total': total, 'today': today}),
    }
