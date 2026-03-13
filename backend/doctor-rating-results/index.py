import json
import os
import psycopg2

def handler(event, context):
    """Получение результатов рейтинга врачей с разбивкой по оценкам и средним баллом"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if event.get('httpMethod') != 'GET':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("""
        SELECT
            d.id,
            d.full_name,
            d.specialization,
            d.position,
            d.clinic,
            COUNT(r.id) AS total_votes,
            ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
            SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS r1,
            SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS r2,
            SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS r3,
            SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS r4,
            SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS r5
        FROM t_p30358746_hospital_website_red.doctors d
        LEFT JOIN t_p30358746_hospital_website_red.doctor_ratings r ON r.doctor_id = d.id
        WHERE d.is_active = true
        GROUP BY d.id, d.full_name, d.specialization, d.position, d.clinic
        ORDER BY d.clinic, avg_rating DESC NULLS LAST, d.full_name
    """)

    rows = cur.fetchall()

    cur.execute("""
        SELECT
            r.id,
            d.full_name AS doctor_name,
            d.clinic,
            r.rating,
            r.ip_address,
            r.user_agent,
            r.fingerprint,
            r.voted_at
        FROM t_p30358746_hospital_website_red.doctor_ratings r
        JOIN t_p30358746_hospital_website_red.doctors d ON d.id = r.doctor_id
        ORDER BY r.voted_at DESC
        LIMIT 500
    """)
    votes_rows = cur.fetchall()

    cur.close()
    conn.close()

    results = []
    for row in rows:
        results.append({
            'doctor_id': row[0],
            'full_name': row[1] or '',
            'specialization': row[2] or '',
            'position': row[3] or '',
            'clinic': row[4] or '',
            'total_votes': int(row[5]),
            'avg_rating': float(row[6]) if row[6] else 0,
            'r1': int(row[7]),
            'r2': int(row[8]),
            'r3': int(row[9]),
            'r4': int(row[10]),
            'r5': int(row[11]),
        })

    votes = []
    for row in votes_rows:
        votes.append({
            'id': row[0],
            'doctor_name': row[1] or '',
            'clinic': row[2] or '',
            'rating': row[3],
            'ip_address': row[4] or '',
            'user_agent': row[5] or '',
            'fingerprint': row[6] or '',
            'voted_at': row[7].strftime('%Y-%m-%d %H:%M:%S') if row[7] else '',
        })

    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'results': results, 'votes': votes}, ensure_ascii=False)}
