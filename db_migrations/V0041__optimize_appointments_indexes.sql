-- Оптимизация производительности функции appointments
-- Добавление индексов для ускорения частых запросов

-- Индекс для быстрого поиска записей по врачу и дате (используется в available-slots и list_appointments)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_time 
ON t_p30358746_hospital_website_red.appointments_v2(doctor_id, appointment_date, appointment_time) 
WHERE status != 'cancelled';

-- Индекс для быстрого поиска расписаний врача
CREATE INDEX IF NOT EXISTS idx_daily_schedules_doctor_date 
ON t_p30358746_hospital_website_red.daily_schedules(doctor_id, schedule_date) 
WHERE is_active = true;

-- Индекс для фильтрации по статусу записи
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON t_p30358746_hospital_website_red.appointments_v2(status);

-- Индекс для поиска записей по телефону пациента (быстрая проверка дубликатов)
CREATE INDEX IF NOT EXISTS idx_appointments_phone 
ON t_p30358746_hospital_website_red.appointments_v2(patient_phone) 
WHERE status = 'scheduled';