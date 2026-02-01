import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления записями на приём к врачам
    GET - получить записи
    POST - создать запись
    PUT - обновить данные пациента в записи
    DELETE - отменить запись
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            apt_id = body.get('id')
            
            if not apt_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID required'}),
                    'isBase64Encoded': False
                }
            
            name = body.get('patient_name', '').strip().replace("'", "''")
            phone = body.get('patient_phone', '').strip().replace("'", "''")
            snils = body.get('snils', '').strip().replace("'", "''")
            oms = body.get('oms', '').strip().replace("'", "''")
            desc = body.get('description', '').strip().replace("'", "''")
            
            if not name or not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name and phone required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            sql = f"""UPDATE appointments_v2 SET 
                      patient_name='{name}', 
                      patient_phone='{phone}', 
                      patient_snils={f"'{snils}'" if snils else 'NULL'}, 
                      patient_oms={f"'{oms}'" if oms else 'NULL'}, 
                      description={f"'{desc}'" if desc else 'NULL'} 
                      WHERE id={apt_id} RETURNING *"""
            
            cursor.execute(sql)
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Appointment not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'appointment': dict(result)}, default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
