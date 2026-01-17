-- Добавление колонки slot_duration в таблицу doctor_schedules
ALTER TABLE doctor_schedules ADD COLUMN slot_duration INTEGER DEFAULT 15;

COMMENT ON COLUMN doctor_schedules.slot_duration IS 'Длительность слота времени в минутах (по умолчанию 15)';