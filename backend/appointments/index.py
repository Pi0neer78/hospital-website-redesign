import json
import os
from datetime import datetime, time, timedelta, date
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления записями пациентов к врачам"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        params = event.get('queryStringParameters') or {}
        action = params.get('action', '')
        
        if action == 'available-slots':
            result = get_available_slots(cursor, params)
        elif action == 'create':
            body = json.loads(event.get('body', '{}'))
            result = create_appointment(cursor, conn, body)
        elif action == 'list':
            result = list_appointments(cursor, params)
        elif action == 'update':
            body = json.loads(event.get('body', '{}'))
            result = update_appointment(cursor, conn, body)
        elif action == 'cancel':
            body = json.loads(event.get('body', '{}'))
            result = cancel_appointment(cursor, conn, body)
        elif action == 'reschedule':
            body = json.loads(event.get('body', '{}'))
            result = reschedule_appointment(cursor, conn, body)
        else:
            result = {'error': 'Unknown action'}
            
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_available_slots(cursor, params):
    """Генерация доступных слотов для записи с учетом рабочего времени врача"""
    doctor_id = int(params.get('doctor_id', 0))
    date_str = params.get('date', '')
    
    if not doctor_id or not date_str:
        return {'available_slots': []}
    
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    
    cursor.execute("""
        SELECT start_time, end_time, break_start_time, break_end_time, slot_duration
        FROM t_p30358746_hospital_website_red.daily_schedules
        WHERE doctor_id = %s AND schedule_date = %s AND is_active = true
    """, (doctor_id, target_date))
    
    schedule = cursor.fetchone()
    
    if not schedule:
        return {'available_slots': []}
    
    start_time = schedule['start_time']
    end_time = schedule['end_time']
    break_start = schedule['break_start_time']
    break_end = schedule['break_end_time']
    slot_duration = schedule['slot_duration']
    
    cursor.execute("""
        SELECT appointment_time
        FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE doctor_id = %s AND appointment_date = %s AND status != 'cancelled'
    """, (doctor_id, target_date))
    
    booked_times = {row['appointment_time'] for row in cursor.fetchall()}
    
    available_slots = []
    current_time = datetime.combine(target_date, start_time)
    end_datetime = datetime.combine(target_date, end_time)
    
    while current_time < end_datetime:
        slot_time = current_time.time()
        
        if break_start and break_end:
            if break_start <= slot_time < break_end:
                current_time += timedelta(minutes=slot_duration)
                continue
        
        if slot_time not in booked_times:
            available_slots.append(slot_time.strftime('%H:%M'))
        
        current_time += timedelta(minutes=slot_duration)
    
    return {'available_slots': available_slots}

def create_appointment(cursor, conn, body):
    """Создание новой записи пациента"""
    doctor_id = body.get('doctor_id')
    patient_name = body.get('patient_name')
    patient_phone = body.get('patient_phone')
    appointment_date = body.get('appointment_date')
    appointment_time = body.get('appointment_time')
    description = body.get('description', '')
    patient_snils = body.get('patient_snils', '')
    patient_oms = body.get('patient_oms', '')
    
    cursor.execute("""
        INSERT INTO t_p30358746_hospital_website_red.appointments_v2 
        (doctor_id, patient_name, patient_phone, appointment_date, appointment_time, description, patient_snils, patient_oms, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'scheduled')
        RETURNING id
    """, (doctor_id, patient_name, patient_phone, appointment_date, appointment_time, description, patient_snils, patient_oms))
    
    appointment_id = cursor.fetchone()['id']
    conn.commit()
    
    return {'success': True, 'appointment_id': appointment_id}

def list_appointments(cursor, params):
    """Получение списка записей"""
    doctor_id = params.get('doctor_id')
    
    query = """
        SELECT a.*, d.full_name as doctor_name, d.specialization
        FROM t_p30358746_hospital_website_red.appointments_v2 a
        JOIN t_p30358746_hospital_website_red.doctors d ON a.doctor_id = d.id
        WHERE 1=1
    """
    query_params = []
    
    if doctor_id:
        query += " AND a.doctor_id = %s"
        query_params.append(int(doctor_id))
    
    query += " ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    
    cursor.execute(query, query_params)
    appointments = cursor.fetchall()
    
    return {'appointments': appointments}

def update_appointment(cursor, conn, body):
    """Обновление данных записи"""
    appointment_id = body.get('id')
    
    update_fields = []
    params = []
    
    if 'patient_name' in body:
        update_fields.append('patient_name = %s')
        params.append(body['patient_name'])
    if 'patient_phone' in body:
        update_fields.append('patient_phone = %s')
        params.append(body['patient_phone'])
    if 'patient_snils' in body:
        update_fields.append('patient_snils = %s')
        params.append(body['patient_snils'])
    if 'patient_oms' in body:
        update_fields.append('patient_oms = %s')
        params.append(body['patient_oms'])
    if 'description' in body:
        update_fields.append('description = %s')
        params.append(body['description'])
    
    if not update_fields:
        return {'success': False, 'error': 'No fields to update'}
    
    params.append(appointment_id)
    query = f"""
        UPDATE t_p30358746_hospital_website_red.appointments_v2
        SET {', '.join(update_fields)}
        WHERE id = %s
    """
    
    cursor.execute(query, params)
    conn.commit()
    
    return {'success': True}

def cancel_appointment(cursor, conn, body):
    """Отмена записи"""
    appointment_id = body.get('id')
    
    cursor.execute("""
        UPDATE t_p30358746_hospital_website_red.appointments_v2
        SET status = 'cancelled'
        WHERE id = %s
    """, (appointment_id,))
    
    conn.commit()
    
    return {'success': True}

def reschedule_appointment(cursor, conn, body):
    """Перенос записи на другое время"""
    appointment_id = body.get('id')
    new_date = body.get('new_date')
    new_time = body.get('new_time')
    
    cursor.execute("""
        UPDATE t_p30358746_hospital_website_red.appointments_v2
        SET appointment_date = %s, appointment_time = %s
        WHERE id = %s
    """, (new_date, new_time, appointment_id))
    
    conn.commit()
    
    return {'success': True}
