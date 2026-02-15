import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event, context):
    """Получение статистики голосований за разные периоды"""
    
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
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    now = datetime.now()
    periods = {
        'day': now - timedelta(days=1),
        'week': now - timedelta(days=7),
        'month': now - timedelta(days=30),
        'year': datetime(now.year, 1, 1)
    }
    
    stats = {}
    
    for period_name, start_date in periods.items():
        cur.execute("""
            SELECT 
                COUNT(*) as total_count,
                AVG(rating) as avg_rating,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5
            FROM t_p30358746_hospital_website_red.queue_ratings
            WHERE created_at >= %s
        """, (start_date,))
        
        result = cur.fetchone()
        
        stats[period_name] = {
            'total_count': int(result[0]) if result[0] else 0,
            'avg_rating': round(float(result[1]), 2) if result[1] else 0,
            'rating_1': int(result[2]) if result[2] else 0,
            'rating_2': int(result[3]) if result[3] else 0,
            'rating_3': int(result[4]) if result[4] else 0,
            'rating_4': int(result[5]) if result[5] else 0,
            'rating_5': int(result[6]) if result[6] else 0
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'stats': stats}, ensure_ascii=False)
    }
