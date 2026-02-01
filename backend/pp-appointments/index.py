import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления записями на приём к врачам
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
            action = body.get('action')
            appointment_id = body.get('id')
            
            if not appointment_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Appointment ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'update_patient_info':
                patient_name = body.get('patient_name', '').replace("'", "''")
                patient_phone = body.get('patient_phone', '').replace("'", "''")
                patient_snils = body.get('snils', '').replace("'", "''") if body.get('snils') else None
                patient_oms = body.get('oms', '').replace("'", "''") if body.get('oms') else None
                description = body.get('description', '').replace("'", "''") if body.get('description') else None
                
                if not patient_name or not patient_phone:
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Name and phone required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    f"""UPDATE appointments_v2 
                       SET patient_name = '{patient_name}', patient_phone = '{patient_phone}', 
                           patient_snils = {f"'{patient_snils}'" if patient_snils else 'NULL'}, 
                           patient_oms = {f"'{patient_oms}'" if patient_oms else 'NULL'}, 
                           description = {f"'{description}'" if description else 'NULL'} 
                       WHERE id = {appointment_id} RETURNING *"""
                )
                appointment = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                if not appointment:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Appointment not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'appointment': dict(appointment)}, default=str),
                    'isBase64Encoded': False
                }
            
            cursor.close()
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()