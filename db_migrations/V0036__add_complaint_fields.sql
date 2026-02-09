-- Добавляем поля для работы с жалобами в кабинете главного врача
ALTER TABLE t_p30358746_hospital_website_red.complaints 
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;