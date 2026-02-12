import json
import os
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
                booked_times = [str(appt['appointment_time']) for appt in booked_appointments]
                
                start_time = datetime.strptime(schedule['start_time'], '%H:%M:%S')
                end_time = datetime.strptime(schedule['end_time'], '%H:%M:%S')
                slot_duration = schedule.get('slot_duration', 15)
                
                break_start = schedule.get('break_start_time')
                break_end = schedule.get('break_end_time')
                break_start_time = datetime.strptime(break_start, '%H:%M:%S') if break_start else None
                break_end_time = datetime.strptime(break_end, '%H:%M:%S') if break_end else None
                
                available_slots = []
                current_time = start_time
                
                while current_time < end_time:
                    if break_start_time and break_end_time:
                        if break_start_time <= current_time < break_end_time:
                            current_time += timedelta(minutes=slot_duration)
                            continue
                    
                    time_str = current_time.strftime('%H:%M:%S')
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
                        booked_by_date[date].append(str(appt['appointment_time']))
                
                current_date = datetime.strptime(start_date, '%Y-%m-%d')
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
                
                slots_by_date = {}
                
                while current_date <= end_date_obj:
                    date_str = current_date.strftime('%Y-%m-%d')
                    day_of_week = (current_date.weekday() + 1) % 7
                    
                    schedule = daily_schedules.get(date_str) or schedules.get(day_of_week)
                    
                    if schedule:
                        booked_times = booked_by_date.get(date_str, [])
                        
                        start_time = datetime.strptime(schedule['start_time'], '%H:%M:%S')
                        end_time = datetime.strptime(schedule['end_time'], '%H:%M:%S')
                        slot_duration = schedule.get('slot_duration', 15)
                        
                        break_start = schedule.get('break_start_time')
                        break_end = schedule.get('break_end_time')
                        break_start_time = datetime.strptime(break_start, '%H:%M:%S') if break_start else None
                        break_end_time = datetime.strptime(break_end, '%H:%M:%S') if break_end else None
                        
                        available_slots = []
                        current_time = start_time
                        
                        while current_time < end_time:
                            if break_start_time and break_end_time:
                                if break_start_time <= current_time < break_end_time:
                                    current_time += timedelta(minutes=slot_duration)
                                    continue
                            
                            time_str = current_time.strftime('%H:%M:%S')
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
                
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                cursor.execute("""
                    INSERT INTO t_p30358746_hospital_website_red.doctor_logs 
                    (doctor_id, user_login, action_type, details, computer_name) 
                    VALUES (%s, %s, %s, %s, %s)
                """, (doctor_id, user_login, action_type, details, computer_name))
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