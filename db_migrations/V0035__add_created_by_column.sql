-- Добавляем колонку created_by для отслеживания автора записи
-- 1 = пациент, 2 = врач, 3 = регистратор
ALTER TABLE t_p30358746_hospital_website_red.appointments_v2
ADD COLUMN created_by INTEGER DEFAULT 1;

-- Добавляем комментарий для документации
COMMENT ON COLUMN t_p30358746_hospital_website_red.appointments_v2.created_by IS 'Автор записи: 1=пациент, 2=врач, 3=регистратор';

-- Создаём индекс для быстрой фильтрации по автору
CREATE INDEX idx_appointments_v2_created_by 
ON t_p30358746_hospital_website_red.appointments_v2 (created_by);