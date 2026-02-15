import json
import os
import psycopg2

def handler(event, context):
    """Сохранение оценки работы электронной очереди"""
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False)
        }
    
    body = json.loads(event.get('body', '{}'))
    appointment_id = body.get('appointment_id')
    patient_name = body.get('patient_name')
    rating = body.get('rating')
    
    if not all([appointment_id, patient_name, rating]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не все данные переданы'}, ensure_ascii=False)
        }
    
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Оценка должна быть от 1 до 5'}, ensure_ascii=False)
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO t_p30358746_hospital_website_red.queue_ratings (appointment_id, patient_name, rating) VALUES (%s, %s, %s)",
        (appointment_id, patient_name, rating)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'message': 'Спасибо за вашу оценку!'}, ensure_ascii=False)
    }
