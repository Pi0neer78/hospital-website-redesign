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
        
        if not action and method == 'GET' and 'doctor_id' in params:
            result = list_appointments(cursor, params)
        elif not action and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            if 'doctor_id' in body and 'appointment_date' in body and 'appointment_time' in body:
                result = create_appointment(cursor, conn, body)
            elif 'id' in body and 'new_date' in body:
                result = reschedule_appointment(cursor, conn, body)
            elif 'id' in body and body.get('status') == 'cancelled':
                result = cancel_appointment(cursor, conn, body)
            elif 'id' in body:
                result = update_appointment(cursor, conn, body)
            else:
                result = {'error': 'Invalid POST request'}
        elif not action and method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            if 'id' in body:
                result = update_appointment(cursor, conn, body)
            else:
                result = {'error': 'Invalid PUT request'}
        elif action == 'available-slots':
            result = get_available_slots(cursor, params)
        elif action == 'available-slots-bulk':
            result = get_available_slots_bulk(cursor, params)
        elif action == 'check-slot':
            result = check_slot_availability(cursor, params)
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
        elif action == 'log':
            body = json.loads(event.get('body', '{}'))
            result = log_doctor_action(cursor, conn, body, event)
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

def get_available_slots_bulk(cursor, params):
    """Получение доступных слотов за период (неделя/месяц) одним запросом"""
    doctor_id = int(params.get('doctor_id', 0))
    start_date_str = params.get('start_date', '')
    end_date_str = params.get('end_date', '')
    
    if not doctor_id or not start_date_str or not end_date_str:
        return {'slots_by_date': {}}
    
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    
    # Получаем все расписания за период одним запросом
    cursor.execute("""
        SELECT schedule_date, start_time, end_time, break_start_time, break_end_time, slot_duration
        FROM t_p30358746_hospital_website_red.daily_schedules
        WHERE doctor_id = %s AND schedule_date BETWEEN %s AND %s AND is_active = true
        ORDER BY schedule_date
    """, (doctor_id, start_date, end_date))
    
    schedules = cursor.fetchall()
    
    if not schedules:
        return {'slots_by_date': {}}
    
    # Получаем все занятые слоты за период одним запросом
    cursor.execute("""
        SELECT appointment_date, appointment_time
        FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE doctor_id = %s AND appointment_date BETWEEN %s AND %s AND status != 'cancelled'
    """, (doctor_id, start_date, end_date))
    
    booked_slots = cursor.fetchall()
    booked_times_by_date = {}
    for slot in booked_slots:
        date_key = slot['appointment_date'].strftime('%Y-%m-%d')
        if date_key not in booked_times_by_date:
            booked_times_by_date[date_key] = set()
        booked_times_by_date[date_key].add(slot['appointment_time'])
    
    # Генерируем слоты для каждой даты
    slots_by_date = {}
    for schedule in schedules:
        target_date = schedule['schedule_date']
        date_key = target_date.strftime('%Y-%m-%d')
        start_time = schedule['start_time']
        end_time = schedule['end_time']
        break_start = schedule['break_start_time']
        break_end = schedule['break_end_time']
        slot_duration = schedule['slot_duration']
        
        booked_times = booked_times_by_date.get(date_key, set())
        
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
        
        slots_by_date[date_key] = available_slots
    
    return {'slots_by_date': slots_by_date}

def check_slot_availability(cursor, params):
    """Проверка доступности конкретного слота"""
    doctor_id = int(params.get('doctor_id', 0))
    date_str = params.get('date', '')
    time_str = params.get('time', '')
    
    if not doctor_id or not date_str or not time_str:
        return {'available': False, 'error': 'Missing parameters'}
    
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    target_time = datetime.strptime(time_str, '%H:%M').time()
    
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status != 'cancelled'
    """, (doctor_id, target_date, target_time))
    
    result = cursor.fetchone()
    available = result['count'] == 0
    
    return {'available': available}

def create_appointment(cursor, conn, body):
    """Создание новой записи"""
    doctor_id = body.get('doctor_id')
    appointment_date = body.get('appointment_date')
    appointment_time = body.get('appointment_time')
    patient_name = body.get('patient_name')
    patient_phone = body.get('patient_phone')
    patient_snils = body.get('patient_snils', '')
    patient_oms = body.get('patient_oms', '')
    description = body.get('description', '')
    source = body.get('source', 'online')
    created_by = body.get('created_by')
    
    if not all([doctor_id, appointment_date, appointment_time, patient_name, patient_phone]):
        return {'error': 'Missing required fields'}
    
    # Проверка доступности слота
    target_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
    target_time = datetime.strptime(appointment_time, '%H:%M').time()
    
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status != 'cancelled'
    """, (doctor_id, target_date, target_time))
    
    if cursor.fetchone()['count'] > 0:
        return {'error': 'Slot already booked'}
    
    cursor.execute("""
        INSERT INTO t_p30358746_hospital_website_red.appointments_v2 
        (doctor_id, appointment_date, appointment_time, patient_name, patient_phone, 
         patient_snils, patient_oms, description, status, source, created_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
    """, (doctor_id, target_date, target_time, patient_name, patient_phone,
          patient_snils, patient_oms, description, 'confirmed', source, created_by))
    
    result = cursor.fetchone()
    conn.commit()
    
    return {
        'success': True,
        'appointment_id': result['id'],
        'created_at': str(result['created_at'])
    }

def list_appointments(cursor, params):
    """Получение списка записей"""
    doctor_id = params.get('doctor_id')
    date_from = params.get('date_from')
    date_to = params.get('date_to')
    status = params.get('status')
    
    query = "SELECT * FROM t_p30358746_hospital_website_red.appointments_v2 WHERE 1=1"
    query_params = []
    
    if doctor_id:
        query += " AND doctor_id = %s"
        query_params.append(int(doctor_id))
    
    if date_from:
        query += " AND appointment_date >= %s"
        query_params.append(date_from)
    
    if date_to:
        query += " AND appointment_date <= %s"
        query_params.append(date_to)
    
    if status:
        query += " AND status = %s"
        query_params.append(status)
    
    query += " ORDER BY appointment_date, appointment_time"
    
    cursor.execute(query, tuple(query_params))
    appointments = cursor.fetchall()
    
    return {'appointments': appointments}

def update_appointment(cursor, conn, body):
    """Обновление записи"""
    appointment_id = body.get('id')
    
    if not appointment_id:
        return {'error': 'Missing appointment ID'}
    
    updates = []
    params = []
    
    if 'patient_name' in body:
        updates.append("patient_name = %s")
        params.append(body['patient_name'])
    
    if 'patient_phone' in body:
        updates.append("patient_phone = %s")
        params.append(body['patient_phone'])
    
    if 'patient_snils' in body:
        updates.append("patient_snils = %s")
        params.append(body['patient_snils'])
    
    if 'patient_oms' in body:
        updates.append("patient_oms = %s")
        params.append(body['patient_oms'])
    
    if 'description' in body:
        updates.append("description = %s")
        params.append(body['description'])
    
    if 'status' in body:
        updates.append("status = %s")
        params.append(body['status'])
    
    if not updates:
        return {'error': 'No fields to update'}
    
    params.append(appointment_id)
    query = f"UPDATE t_p30358746_hospital_website_red.appointments_v2 SET {', '.join(updates)} WHERE id = %s"
    
    cursor.execute(query, tuple(params))
    conn.commit()
    
    return {'success': True, 'message': 'Appointment updated'}

def cancel_appointment(cursor, conn, body):
    """Отмена записи"""
    appointment_id = body.get('id')
    
    if not appointment_id:
        return {'error': 'Missing appointment ID'}
    
    cursor.execute("""
        UPDATE t_p30358746_hospital_website_red.appointments_v2
        SET status = 'cancelled', cancelled_at = NOW()
        WHERE id = %s
    """, (appointment_id,))
    
    conn.commit()
    
    return {'success': True, 'message': 'Appointment cancelled'}

def reschedule_appointment(cursor, conn, body):
    """Перенос записи на новую дату/время"""
    appointment_id = body.get('id')
    new_date = body.get('new_date')
    new_time = body.get('new_time')
    
    if not all([appointment_id, new_date, new_time]):
        return {'error': 'Missing required fields'}
    
    # Получаем информацию о записи
    cursor.execute("""
        SELECT doctor_id FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE id = %s
    """, (appointment_id,))
    
    appointment = cursor.fetchone()
    if not appointment:
        return {'error': 'Appointment not found'}
    
    # Проверяем доступность нового слота
    target_date = datetime.strptime(new_date, '%Y-%m-%d').date()
    target_time = datetime.strptime(new_time, '%H:%M').time()
    
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s 
        AND status != 'cancelled' AND id != %s
    """, (appointment['doctor_id'], target_date, target_time, appointment_id))
    
    if cursor.fetchone()['count'] > 0:
        return {'error': 'New slot already booked'}
    
    # Обновляем запись
    cursor.execute("""
        UPDATE t_p30358746_hospital_website_red.appointments_v2
        SET appointment_date = %s, appointment_time = %s, rescheduled_at = NOW()
        WHERE id = %s
    """, (target_date, target_time, appointment_id))
    
    conn.commit()
    
    return {'success': True, 'message': 'Appointment rescheduled'}

def log_doctor_action(cursor, conn, body, event):
    """Логирование действий врача"""
    doctor_id = body.get('doctor_id')
    action_type = body.get('action_type')
    details = body.get('details', '')
    
    if not all([doctor_id, action_type]):
        return {'error': 'Missing required fields'}
    
    cursor.execute("""
        INSERT INTO t_p30358746_hospital_website_red.doctor_logs
        (doctor_id, action_type, details, ip_address)
        VALUES (%s, %s, %s, %s)
    """, (doctor_id, action_type, details, event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')))
    
    conn.commit()
    
    return {'success': True, 'message': 'Action logged'}
