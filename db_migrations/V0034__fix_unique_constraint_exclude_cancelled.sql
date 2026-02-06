-- Удаляем старый уникальный индекс
DROP INDEX IF EXISTS t_p30358746_hospital_website_red.idx_appointments_v2_unique;

-- Создаём новый частичный уникальный индекс, исключающий отменённые записи
CREATE UNIQUE INDEX idx_appointments_v2_unique 
ON t_p30358746_hospital_website_red.appointments_v2 (doctor_id, appointment_date, appointment_time)
WHERE status != 'cancelled';