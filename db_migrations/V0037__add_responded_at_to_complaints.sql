-- Добавляем колонку responded_at для отслеживания даты ответа на жалобу
ALTER TABLE t_p30358746_hospital_website_red.complaints 
ADD COLUMN responded_at TIMESTAMP;