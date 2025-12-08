-- Создаем таблицу для хранения MAX user_id пользователей
CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.max_users (
    phone_number VARCHAR(20) PRIMARY KEY,
    max_user_id VARCHAR(100) NOT NULL,
    max_chat_id VARCHAR(100),
    first_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_max_users_user_id ON t_p30358746_hospital_website_red.max_users(max_user_id);