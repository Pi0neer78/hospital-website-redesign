import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление расписанием врачей и календарем
    GET /?doctor_id=X - получить расписание врача
    GET /?action=daily&doctor_id=X&start_date=...&end_date=... - получить ежедневное расписание
    GET /?action=calendar&doctor_id=X&year=2025 - получить календарь врача на год
    POST / - создать/обновить расписание
    POST {action: "daily", doctor_id, schedule_date, start_time, end_time, ...} - создать/обновить день
    POST {action: "calendar", doctor_id, calendar_date, is_working, note} - сохранить день календаря
    POST {action: "bulk_calendar", doctor_id, dates, is_working} - массовое сохранение дней
    PUT / - изменить статус активности или время
    PUT {action: "daily", id, ...} - изменить ежедневное расписание
    DELETE /?id=X - удалить расписание
    DELETE /?action=daily&id=X - удалить день из расписания
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Doctor-Token',
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
            query_params = event.get('queryStringParameters') or {}
            action = query_params.get('action')
            doctor_id = query_params.get('doctor_id')
            
            if not doctor_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'doctor_id is required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'daily':
                start_date = query_params.get('start_date')
                end_date = query_params.get('end_date')
                
                if not start_date or not end_date:
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'start_date and end_date required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """SELECT * FROM daily_schedules 
                       WHERE doctor_id = %s AND schedule_date >= %s AND schedule_date <= %s 
                       ORDER BY schedule_date""",
                    (doctor_id, start_date, end_date)
                )
                daily_schedules = cursor.fetchall()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'daily_schedules': daily_schedules}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'calendar':
                year = query_params.get('year', '2025')
                cursor.execute(
                    "SELECT * FROM doctor_calendar WHERE doctor_id = %s AND EXTRACT(YEAR FROM calendar_date) = %s ORDER BY calendar_date",
                    (doctor_id, year)
                )
                calendar_days = cursor.fetchall()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'calendar': calendar_days}, default=str),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute("SELECT * FROM doctor_schedules WHERE doctor_id = %s ORDER BY day_of_week", (doctor_id,))
                schedules = cursor.fetchall()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'schedules': schedules}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            doctor_id = body.get('doctor_id')
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'calendar':
                calendar_date = body.get('calendar_date')
                is_working = body.get('is_working', True)
                note = body.get('note')
                
                if not all([doctor_id, calendar_date]):
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'doctor_id and calendar_date required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """INSERT INTO doctor_calendar (doctor_id, calendar_date, is_working, note, updated_at)
                       VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                       ON CONFLICT (doctor_id, calendar_date) 
                       DO UPDATE SET is_working = EXCLUDED.is_working, note = EXCLUDED.note, updated_at = CURRENT_TIMESTAMP
                       RETURNING *""",
                    (doctor_id, calendar_date, is_working, note)
                )
                calendar_day = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'calendar_day': calendar_day}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'daily':
                schedule_date = body.get('schedule_date')
                start_time = body.get('start_time')
                end_time = body.get('end_time')
                break_start_time = body.get('break_start_time') or None
                break_end_time = body.get('break_end_time') or None
                slot_duration = body.get('slot_duration', 15)
                is_active = body.get('is_active', True)
                
                if not all([doctor_id, schedule_date, start_time, end_time]):
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """INSERT INTO daily_schedules 
                       (doctor_id, schedule_date, start_time, end_time, break_start_time, break_end_time, slot_duration, is_active, updated_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                       ON CONFLICT (doctor_id, schedule_date)
                       DO UPDATE SET 
                         start_time = EXCLUDED.start_time,
                         end_time = EXCLUDED.end_time,
                         break_start_time = EXCLUDED.break_start_time,
                         break_end_time = EXCLUDED.break_end_time,
                         slot_duration = EXCLUDED.slot_duration,
                         is_active = EXCLUDED.is_active,
                         updated_at = CURRENT_TIMESTAMP
                       RETURNING *""",
                    (doctor_id, schedule_date, start_time, end_time, break_start_time, break_end_time, slot_duration, is_active)
                )
                daily_schedule = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'daily_schedule': daily_schedule}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'bulk_calendar':
                dates = body.get('dates', [])
                is_working = body.get('is_working', True)
                
                if not all([doctor_id, dates]):
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'doctor_id and dates required'}),
                        'isBase64Encoded': False
                    }
                
                for date in dates:
                    cursor.execute(
                        """INSERT INTO doctor_calendar (doctor_id, calendar_date, is_working, updated_at)
                           VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                           ON CONFLICT (doctor_id, calendar_date)
                           DO UPDATE SET is_working = EXCLUDED.is_working, updated_at = CURRENT_TIMESTAMP""",
                        (doctor_id, date, is_working)
                    )
                
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'updated_count': len(dates)}),
                    'isBase64Encoded': False
                }
            
            else:
                day_of_week = body.get('day_of_week')
                start_time = body.get('start_time')
                end_time = body.get('end_time')
                break_start_time = body.get('break_start_time') or None
                break_end_time = body.get('break_end_time') or None
                slot_duration = body.get('slot_duration', 15)
                
                if not all([doctor_id, day_of_week is not None, start_time, end_time]):
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields: doctor_id, day_of_week, start_time, end_time'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("SELECT id FROM doctor_schedules WHERE doctor_id = %s AND day_of_week = %s", (doctor_id, day_of_week))
                existing = cursor.fetchone()
                
                if existing:
                    cursor.execute(
                        "UPDATE doctor_schedules SET start_time = %s, end_time = %s, break_start_time = %s, break_end_time = %s, slot_duration = %s, is_active = true WHERE doctor_id = %s AND day_of_week = %s RETURNING *",
                        (start_time, end_time, break_start_time, break_end_time, slot_duration, doctor_id, day_of_week)
                    )
                else:
                    cursor.execute(
                        "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, slot_duration) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *",
                        (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, slot_duration)
                    )
                
                schedule = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'schedule': schedule}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            schedule_id = body.get('id')
            is_active = body.get('is_active')
            start_time = body.get('start_time')
            end_time = body.get('end_time')
            break_start_time = body.get('break_start_time') or None
            break_end_time = body.get('break_end_time') or None
            slot_duration = body.get('slot_duration', 15)
            
            if not schedule_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Schedule ID is required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            if action == 'daily':
                if is_active is not None:
                    cursor.execute("UPDATE daily_schedules SET is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *", (is_active, schedule_id))
                elif start_time and end_time:
                    cursor.execute(
                        "UPDATE daily_schedules SET start_time = %s, end_time = %s, break_start_time = %s, break_end_time = %s, slot_duration = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                        (start_time, end_time, break_start_time, break_end_time, slot_duration, schedule_id)
                    )
                else:
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Either is_active or time fields are required'}),
                        'isBase64Encoded': False
                    }
                
                daily_schedule = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'daily_schedule': daily_schedule}, default=str),
                    'isBase64Encoded': False
                }
            else:
                if is_active is not None:
                    cursor.execute("UPDATE doctor_schedules SET is_active = %s WHERE id = %s RETURNING *", (is_active, schedule_id))
                elif start_time and end_time:
                    cursor.execute("UPDATE doctor_schedules SET start_time = %s, end_time = %s, break_start_time = %s, break_end_time = %s, slot_duration = %s WHERE id = %s RETURNING *", (start_time, end_time, break_start_time, break_end_time, slot_duration, schedule_id))
                else:
                    cursor.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Either is_active or both start_time and end_time are required'}),
                        'isBase64Encoded': False
                    }
                
                schedule = cursor.fetchone()
                conn.commit()
                cursor.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'schedule': schedule}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            action = query_params.get('action')
            schedule_id = query_params.get('id')
            
            if not schedule_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Schedule ID is required'}),
                    'isBase64Encoded': False
                }
            
            cursor = conn.cursor()
            
            if action == 'daily':
                cursor.execute("DELETE FROM daily_schedules WHERE id = %s", (schedule_id,))
            else:
                cursor.execute("DELETE FROM doctor_schedules WHERE id = %s", (schedule_id,))
            
            conn.commit()
            cursor.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Schedule deleted'}),
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