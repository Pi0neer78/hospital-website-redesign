import json
import os
import logging
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление записями на прием к врачу
    Создание, обновление, отмена, получение списка записей
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
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')
            
            if action == 'available-slots':
                doctor_id = params.get('doctor_id')
                date = params.get('date')
                
                if not doctor_id or not date:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing doctor_id or date'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                cursor.execute("""
                    SELECT is_working FROM t_p30358746_hospital_website_red.doctor_calendar 
                    WHERE doctor_id = %s AND calendar_date = %s
                """, (doctor_id, date))
                calendar_entry = cursor.fetchone()
                
                if calendar_entry and not calendar_entry['is_working']:
                    cursor.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'available_slots': []}),
                        'isBase64Encoded': False
                    }
                
                day_of_week = datetime.strptime(date, '%Y-%m-%d').weekday()
                day_of_week = (day_of_week + 1) % 7
                
                cursor.execute("""
                    SELECT * FROM t_p30358746_hospital_website_red.daily_schedules 
                    WHERE doctor_id = %s AND schedule_date = %s AND is_active = TRUE
                """, (doctor_id, date))
                daily_schedule = cursor.fetchone()
                
                if not daily_schedule:
                    cursor.execute("""
                        SELECT * FROM t_p30358746_hospital_website_red.doctor_schedules 
                        WHERE doctor_id = %s AND day_of_week = %s AND is_active = TRUE
                    """, (doctor_id, day_of_week))
                    schedule = cursor.fetchone()
                else:
                    schedule = daily_schedule
                
                if not schedule:
                    cursor.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'available_slots': []}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("""
                    SELECT appointment_time FROM t_p30358746_hospital_website_red.appointments_v2 
                    WHERE doctor_id = %s AND appointment_date = %s AND status IN ('scheduled', 'completed')
                """, (doctor_id, date))
                booked_appointments = cursor.fetchall()
                booked_times = [str(appt['appointment_time'])[:5] for appt in booked_appointments]
                
                start_time_str = str(schedule['start_time']) if schedule['start_time'] else '09:00:00'
                end_time_str = str(schedule['end_time']) if schedule['end_time'] else '18:00:00'
                start_time = datetime.strptime(start_time_str, '%H:%M:%S')
                end_time = datetime.strptime(end_time_str, '%H:%M:%S')
                slot_duration = schedule.get('slot_duration', 15)
                
                break_start = schedule.get('break_start_time')
                break_end = schedule.get('break_end_time')
                break_start_time = datetime.strptime(str(break_start), '%H:%M:%S') if break_start else None
                break_end_time = datetime.strptime(str(break_end), '%H:%M:%S') if break_end else None
                
                available_slots = []
                current_time = start_time
                
                while current_time < end_time:
                    if break_start_time and break_end_time:
                        if break_start_time <= current_time < break_end_time:
                            current_time += timedelta(minutes=slot_duration)
                            continue
                    
                    time_str = current_time.strftime('%H:%M')
                    if time_str not in booked_times:
                        available_slots.append(time_str)
                    
                    current_time += timedelta(minutes=slot_duration)
                
                cursor.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'available_slots': available_slots}),
                    'isBase64Encoded': False
                }
            
            elif action == 'available-slots-bulk':
                doctor_id = params.get('doctor_id')
                start_date = params.get('start_date')
                end_date = params.get('end_date')
                
                if not doctor_id or not start_date or not end_date:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing parameters'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                cursor.execute("""
                    SELECT * FROM t_p30358746_hospital_website_red.doctor_schedules 
                    WHERE doctor_id = %s AND is_active = TRUE
                """, (doctor_id,))
                schedules = {s['day_of_week']: s for s in cursor.fetchall()}
                
                cursor.execute("""
                    SELECT * FROM t_p30358746_hospital_website_red.daily_schedules 
                    WHERE doctor_id = %s AND schedule_date BETWEEN %s AND %s AND is_active = TRUE
                """, (doctor_id, start_date, end_date))
                daily_schedules = {str(ds['schedule_date']): ds for ds in cursor.fetchall()}
                
                cursor.execute("""
                    SELECT calendar_date, is_working FROM t_p30358746_hospital_website_red.doctor_calendar 
                    WHERE doctor_id = %s AND calendar_date BETWEEN %s AND %s
                """, (doctor_id, start_date, end_date))
                calendar_data = {str(cal['calendar_date']): cal['is_working'] for cal in cursor.fetchall()}
                
                cursor.execute("""
                    SELECT appointment_date, appointment_time FROM t_p30358746_hospital_website_red.appointments_v2 
                    WHERE doctor_id = %s AND appointment_date BETWEEN %s AND %s 
                    AND status IN ('scheduled', 'completed')
                """, (doctor_id, start_date, end_date))
                all_appointments = cursor.fetchall()
                
                booked_by_date = {}
                for appt in all_appointments:
                    date = str(appt['appointment_date']) if appt['appointment_date'] else None
                    if date and date not in booked_by_date:
                        booked_by_date[date] = []
                    if date:
                        booked_by_date[date].append(str(appt['appointment_time'])[:5])
                
                current_date = datetime.strptime(start_date, '%Y-%m-%d')
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
                
                slots_by_date = {}
                
                while current_date <= end_date_obj:
                    date_str = current_date.strftime('%Y-%m-%d')
                    day_of_week = (current_date.weekday() + 1) % 7
                    
                    if date_str in calendar_data and not calendar_data[date_str]:
                        slots_by_date[date_str] = {'available_slots': [], 'booked_slots': 0, 'hasSchedule': False}
                        current_date += timedelta(days=1)
                        continue
                    
                    schedule = daily_schedules.get(date_str) or schedules.get(day_of_week)
                    
                    if schedule:
                        booked_times = booked_by_date.get(date_str, [])
                        
                        start_time_str = str(schedule['start_time']) if schedule['start_time'] else '09:00:00'
                        end_time_str = str(schedule['end_time']) if schedule['end_time'] else '18:00:00'
                        start_time = datetime.strptime(start_time_str, '%H:%M:%S')
                        end_time = datetime.strptime(end_time_str, '%H:%M:%S')
                        slot_duration = schedule.get('slot_duration', 15)
                        
                        break_start = schedule.get('break_start_time')
                        break_end = schedule.get('break_end_time')
                        break_start_time = datetime.strptime(str(break_start), '%H:%M:%S') if break_start else None
                        break_end_time = datetime.strptime(str(break_end), '%H:%M:%S') if break_end else None
                        
                        available_slots = []
                        current_time = start_time
                        
                        while current_time < end_time:
                            if break_start_time and break_end_time:
                                if break_start_time <= current_time < break_end_time:
                                    current_time += timedelta(minutes=slot_duration)
                                    continue
                            
                            time_str = current_time.strftime('%H:%M')
                            if time_str not in booked_times:
                                available_slots.append(time_str)
                            
                            current_time += timedelta(minutes=slot_duration)
                        
                        slots_by_date[date_str] = {
                            'available_slots': available_slots,
                            'booked_slots': len(booked_times)
                        }
                    else:
                        slots_by_date[date_str] = {
                            'available_slots': [],
                            'booked_slots': 0
                        }
                    
                    current_date += timedelta(days=1)
                
                cursor.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'slots_by_date': slots_by_date}),
                    'isBase64Encoded': False
                }
            
            elif action == 'check-slot':
                doctor_id = params.get('doctor_id')
                date = params.get('date')
                time = params.get('time')
                appointment_id = params.get('appointment_id')
                
                if not doctor_id or not date or not time:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing parameters'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                if appointment_id:
                    cursor.execute("""
                        SELECT * FROM t_p30358746_hospital_website_red.appointments_v2 
                        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s 
                        AND status IN ('scheduled', 'completed') AND id != %s
                    """, (doctor_id, date, time, appointment_id))
                else:
                    cursor.execute("""
                        SELECT * FROM t_p30358746_hospital_website_red.appointments_v2 
                        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s 
                        AND status IN ('scheduled', 'completed')
                    """, (doctor_id, date, time))
                
                existing = cursor.fetchone()
                cursor.close()
                
                if existing:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'available': False,
                            'error': f'Слот {time[:5]} уже занят пациентом {existing["patient_name"]}'
                        }),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'available': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'my-appointments':
                phone = params.get('phone', '').strip()
                if not phone:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Не указан номер телефона'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                # Нормализуем номер: убираем +, пробелы, скобки, дефисы
                phone_clean = phone.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
                
                cursor.execute("""
                    SELECT 
                        a.id,
                        a.patient_name,
                        a.patient_phone,
                        a.appointment_date,
                        a.appointment_time,
                        a.description,
                        a.status,
                        a.created_at,
                        a.created_by,
                        a.patient_snils,
                        a.patient_oms,
                        d.full_name as doctor_name,
                        d.specialization as doctor_specialization
                    FROM t_p30358746_hospital_website_red.appointments_v2 a
                    LEFT JOIN t_p30358746_hospital_website_red.doctors d ON d.id = a.doctor_id
                    WHERE REGEXP_REPLACE(a.patient_phone, '[^0-9]', '', 'g') LIKE '%' || RIGHT(REGEXP_REPLACE(%s, '[^0-9]', '', 'g'), 10) || '%'
                    ORDER BY a.appointment_date DESC, a.appointment_time DESC
                """, (phone_clean,))
                
                appointments = cursor.fetchall()
                cursor.close()
                
                # Преобразуем created_by в читаемый текст
                def get_created_by_label(val):
                    if val == 1:
                        return 'Самостоятельно'
                    elif val == 2:
                        return 'Регистратором'
                    elif val == 3:
                        return 'Врачом'
                    else:
                        return 'Самостоятельно'
                
                result = []
                for a in appointments:
                    result.append({
                        'id': a['id'],
                        'patient_name': a['patient_name'],
                        'patient_phone': a['patient_phone'],
                        'appointment_date': str(a['appointment_date']) if a['appointment_date'] else None,
                        'appointment_time': str(a['appointment_time'])[:5] if a['appointment_time'] else None,
                        'description': a['description'] or '',
                        'status': a['status'] or 'scheduled',
                        'created_at': str(a['created_at']) if a['created_at'] else None,
                        'created_by': get_created_by_label(a['created_by']),
                        'doctor_name': a['doctor_name'] or '',
                        'doctor_specialization': a['doctor_specialization'] or '',
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'appointments': result}),
                    'isBase64Encoded': False
                }
            
            elif action == 'logs':
                doctor_id = params.get('doctor_id')
                limit = int(params.get('limit', '500'))
                if limit > 2000:
                    limit = 2000
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                if doctor_id:
                    cursor.execute("""
                        SELECT dl.id, dl.doctor_id, dl.action_type, dl.details, 
                               dl.ip_address, dl.computer_name, dl.created_at, dl.user_login,
                               d.full_name as doctor_name
                        FROM t_p30358746_hospital_website_red.doctor_logs dl
                        LEFT JOIN t_p30358746_hospital_website_red.doctors d ON d.id = dl.doctor_id
                        WHERE dl.doctor_id = %s
                        ORDER BY dl.created_at DESC LIMIT %s
                    """, (doctor_id, limit))
                else:
                    cursor.execute("""
                        SELECT dl.id, dl.doctor_id, dl.action_type, dl.details, 
                               dl.ip_address, dl.computer_name, dl.created_at, dl.user_login,
                               d.full_name as doctor_name
                        FROM t_p30358746_hospital_website_red.doctor_logs dl
                        LEFT JOIN t_p30358746_hospital_website_red.doctors d ON d.id = dl.doctor_id
                        ORDER BY dl.created_at DESC LIMIT %s
                    """, (limit,))
                
                logs = cursor.fetchall()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'logs': logs}, default=str),
                    'isBase64Encoded': False
                }
            
            else:
                doctor_id = params.get('doctor_id')
                start_date = params.get('start_date')
                end_date = params.get('end_date')
                
                if not doctor_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing doctor_id'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                query = "SELECT * FROM t_p30358746_hospital_website_red.appointments_v2 WHERE doctor_id = %s"
                query_params = [doctor_id]
                
                if start_date:
                    query += " AND appointment_date >= %s"
                    query_params.append(start_date)
                
                if end_date:
                    query += " AND appointment_date <= %s"
                    query_params.append(end_date)
                
                query += " ORDER BY appointment_date, appointment_time"
                
                cursor.execute(query, tuple(query_params))
                appointments = cursor.fetchall()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'appointments': appointments}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')
            
            if action == 'log':
                doctor_id = body.get('doctor_id')
                user_login = body.get('user_login')
                action_type = body.get('action_type')
                details = body.get('details')
                computer_name = body.get('computer_name', '')
                
                headers_req = event.get('headers', {})
                ip_address = (
                    headers_req.get('X-Forwarded-For', '').split(',')[0].strip() or
                    headers_req.get('X-Real-IP', '') or
                    event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')
                )
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute("""
                    INSERT INTO t_p30358746_hospital_website_red.doctor_logs 
                    (doctor_id, user_login, action_type, details, ip_address, computer_name) 
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (doctor_id, user_login, action_type, details, ip_address, computer_name))
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            else:
                doctor_id = body.get('doctor_id')
                patient_name = body.get('patient_name')
                patient_phone = body.get('patient_phone')
                patient_snils = body.get('patient_snils', '')
                patient_oms = body.get('patient_oms', '')
                appointment_date = body.get('appointment_date')
                appointment_time = body.get('appointment_time')
                description = body.get('description', '')
                created_by = body.get('created_by', 1)
                skip_slot_check = body.get('skip_slot_check', False)
                
                if not all([doctor_id, patient_name, patient_phone, appointment_date, appointment_time]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                if not skip_slot_check:
                    cursor.execute("""
                        SELECT * FROM t_p30358746_hospital_website_red.appointments_v2 
                        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s 
                        AND status IN ('scheduled', 'completed')
                    """, (doctor_id, appointment_date, appointment_time))
                    existing = cursor.fetchone()
                    
                    if existing:
                        cursor.close()
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': f'Слот {appointment_time[:5]} уже занят'}),
                            'isBase64Encoded': False
                        }
                
                cursor.execute("""
                    INSERT INTO t_p30358746_hospital_website_red.appointments_v2 
                    (doctor_id, patient_name, patient_phone, patient_snils, patient_oms, 
                     appointment_date, appointment_time, description, status, created_by) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'scheduled', %s)
                    RETURNING id, created_at
                """, (doctor_id, patient_name, patient_phone, patient_snils, patient_oms, 
                      appointment_date, appointment_time, description, created_by))
                
                result = cursor.fetchone()

                source_map = {1: 'self', 2: 'doctor', 3: 'registrar'}
                registry_source = source_map.get(created_by, 'self')
                upsert_registry(cursor, patient_name, patient_phone, None, registry_source)

                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'appointment': {
                            'id': result['id'],
                            'created_at': str(result['created_at'])
                        }
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            appointment_id = body.get('id')
            
            if not appointment_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing appointment id'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            update_fields = []
            update_values = []
            
            if 'status' in body:
                update_fields.append('status = %s')
                update_values.append(body['status'])
            
            if 'description' in body:
                update_fields.append('description = %s')
                update_values.append(body['description'])
            
            if 'completed_at' in body:
                update_fields.append('completed_at = %s')
                update_values.append(body['completed_at'])
            
            if 'appointment_date' in body and 'appointment_time' in body:
                new_date = body['appointment_date']
                new_time = body['appointment_time']
                
                cursor.execute("""
                    SELECT doctor_id FROM t_p30358746_hospital_website_red.appointments_v2 
                    WHERE id = %s
                """, (appointment_id,))
                appt = cursor.fetchone()
                
                if appt:
                    cursor.execute("""
                        SELECT * FROM t_p30358746_hospital_website_red.appointments_v2 
                        WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s 
                        AND status IN ('scheduled', 'completed') AND id != %s
                    """, (appt['doctor_id'], new_date, new_time, appointment_id))
                    existing = cursor.fetchone()
                    
                    if existing:
                        cursor.close()
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': f'Слот {new_time[:5]} уже занят'}),
                            'isBase64Encoded': False
                        }
                
                update_fields.append('appointment_date = %s')
                update_values.append(new_date)
                update_fields.append('appointment_time = %s')
                update_values.append(new_time)
            
            if 'patient_name' in body:
                update_fields.append('patient_name = %s')
                update_values.append(body['patient_name'])
            
            if 'patient_phone' in body:
                update_fields.append('patient_phone = %s')
                update_values.append(body['patient_phone'])
            
            if 'patient_snils' in body:
                update_fields.append('patient_snils = %s')
                update_values.append(body['patient_snils'])
            
            if 'patient_oms' in body:
                update_fields.append('patient_oms = %s')
                update_values.append(body['patient_oms'])
            
            if not update_fields:
                cursor.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_values.append(appointment_id)
            query = f"UPDATE t_p30358746_hospital_website_red.appointments_v2 SET {', '.join(update_fields)} WHERE id = %s"
            
            cursor.execute(query, tuple(update_values))
            conn.commit()
            cursor.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            appointment_id = params.get('id')
            
            if not appointment_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing appointment id'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("DELETE FROM t_p30358746_hospital_website_red.appointments_v2 WHERE id = %s", (appointment_id,))
            conn.commit()
            cursor.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()


def upsert_registry(cursor, full_name, phone, email, source):
    now = datetime.now().isoformat()
    if phone:
        cursor.execute(
            "SELECT id FROM t_p30358746_hospital_website_red.reest_phone_max WHERE phone = %s",
            (phone,)
        )
        existing = cursor.fetchone()
        if existing:
            fields = ['updated_at = NOW()', 'appointment_date = %s']
            vals = [now]
            if full_name:
                fields.append('full_name = %s')
                vals.append(full_name)
            vals.append(existing['id'])
            cursor.execute(
                f"UPDATE t_p30358746_hospital_website_red.reest_phone_max SET {', '.join(fields)} WHERE id = %s",
                tuple(vals)
            )
            return

    cursor.execute(
        "INSERT INTO t_p30358746_hospital_website_red.reest_phone_max (full_name, phone, email, source_type, source, appointment_date) VALUES (%s, %s, %s, %s, %s, %s)",
        (full_name, phone or None, email or None, source, source, now)
    )