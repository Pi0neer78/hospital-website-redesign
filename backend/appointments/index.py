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
        
        slots_by_date[date_key] = {
            'available_slots': available_slots,
            'total_slots': len(available_slots) + len(booked_times),
            'booked_slots': len(booked_times)
        }
    
    return {'slots_by_date': slots_by_date}

def check_slot_availability(cursor, params):
    """Проверка доступности конкретного слота времени"""
    doctor_id = params.get('doctor_id')
    date_str = params.get('date')
    time_str = params.get('time')
    exclude_id = params.get('exclude_id')
    
    if not all([doctor_id, date_str, time_str]):
        return {'available': False, 'error': 'Не указаны необходимые параметры'}
    
    doctor_id = int(doctor_id)
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    target_time = datetime.strptime(time_str, '%H:%M').time()
    
    query = """
        SELECT COUNT(*) as count
        FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE doctor_id = %s 
        AND appointment_date = %s 
        AND appointment_time = %s 
        AND status != 'cancelled'
    """
    params_list = [doctor_id, target_date, target_time]
    
    if exclude_id:
        query += " AND id != %s"
        params_list.append(int(exclude_id))
    
    cursor.execute(query, params_list)
    result = cursor.fetchone()
    
    if result['count'] > 0:
        return {
            'available': False, 
            'error': f'Время {time_str} на {target_date.strftime("%d.%m.%Y")} уже занято'
        }
    
    return {'available': True}

def create_appointment(cursor, conn, body):
    """Создание новой записи пациента (ОПТИМИЗИРОВАНО: встроенная валидация слота)"""
    doctor_id = body.get('doctor_id')
    patient_name = body.get('patient_name')
    patient_phone = body.get('patient_phone')
    appointment_date = body.get('appointment_date')
    appointment_time = body.get('appointment_time')
    description = body.get('description', '')
    patient_snils = body.get('patient_snils', '')
    patient_oms = body.get('patient_oms', '')
    created_by = body.get('created_by', 1)
    skip_slot_check = body.get('skip_slot_check', False)
    
    # ОПТИМИЗАЦИЯ: проверка доступности слота перед вставкой (если не пропущена)
    if not skip_slot_check:
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM t_p30358746_hospital_website_red.appointments_v2
            WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status != 'cancelled'
        """, (doctor_id, appointment_date, appointment_time))
        
        result = cursor.fetchone()
        if result['count'] > 0:
            return {'success': False, 'error': 'Этот слот времени уже занят'}
    
    cursor.execute("""
        INSERT INTO t_p30358746_hospital_website_red.appointments_v2 
        (doctor_id, patient_name, patient_phone, appointment_date, appointment_time, description, patient_snils, patient_oms, status, created_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'scheduled', %s)
        RETURNING id, doctor_id, patient_name, patient_phone, appointment_date, appointment_time, description, patient_snils, patient_oms, status, created_by, created_at
    """, (doctor_id, patient_name, patient_phone, appointment_date, appointment_time, description, patient_snils, patient_oms, created_by))
    
    appointment = cursor.fetchone()
    conn.commit()
    
    return {'success': True, 'appointment_id': appointment['id'], 'appointment': dict(appointment)}

def list_appointments(cursor, params):
    """Получение списка записей (ОПТИМИЗИРОВАНО: фильтрация по датам)"""
    doctor_id = params.get('doctor_id')
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    
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
    
    # ОПТИМИЗАЦИЯ: фильтруем по датам для уменьшения объема данных
    if start_date:
        query += " AND a.appointment_date >= %s"
        query_params.append(start_date)
    
    if end_date:
        query += " AND a.appointment_date <= %s"
        query_params.append(end_date)
    
    query += " ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    
    # ОПТИМИЗАЦИЯ: ограничиваем выборку для защиты от больших данных
    if not start_date and not end_date:
        query += " LIMIT 500"
    
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
    if 'status' in body:
        update_fields.append('status = %s')
        params.append(body['status'])
    if 'completed_at' in body:
        update_fields.append('completed_at = %s')
        params.append(body['completed_at'])
    
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
    
    # Получаем doctor_id текущей записи
    cursor.execute("""
        SELECT doctor_id FROM t_p30358746_hospital_website_red.appointments_v2
        WHERE id = %s
    """, (appointment_id,))
    appointment = cursor.fetchone()
    
    if not appointment:
        return {'success': False, 'error': 'Запись не найдена'}
    
    # Проверяем доступность нового слота (исключая текущую запись)
    availability = check_slot_availability(cursor, {
        'doctor_id': str(appointment['doctor_id']),
        'date': new_date,
        'time': new_time,
        'exclude_id': str(appointment_id)
    })
    
    if not availability.get('available'):
        return {'success': False, 'error': availability.get('error', 'Слот занят')}
    
    # Переносим запись
    cursor.execute("""
        UPDATE t_p30358746_hospital_website_red.appointments_v2
        SET appointment_date = %s, appointment_time = %s
        WHERE id = %s
    """, (new_date, new_time, appointment_id))
    
    conn.commit()
    
    return {'success': True}

def log_doctor_action(cursor, conn, body, event):
    """Логирование действий врача"""
    doctor_id = body.get('doctor_id')
    user_login = body.get('user_login')
    action_type = body.get('action_type')
    details = body.get('details')
    computer_name = body.get('computer_name')
    
    # Получение реального IP-адреса из заголовков
    headers = event.get('headers', {})
    ip_address = (
        headers.get('X-Forwarded-For', '').split(',')[0].strip() or
        headers.get('X-Real-IP', '') or
        headers.get('CF-Connecting-IP', '') or
        event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
    )
    
    cursor.execute("""
        INSERT INTO t_p30358746_hospital_website_red.doctor_logs 
        (doctor_id, user_login, action_type, details, ip_address, computer_name)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (doctor_id, user_login, action_type, details, ip_address, computer_name))
    
    conn.commit()
    
    return {'success': True}