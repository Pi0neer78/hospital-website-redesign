-- Создание таблицы для логирования действий врачей
CREATE TABLE IF NOT EXISTS doctor_logs (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id),
    action_type VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    computer_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_doctor_logs_doctor_id ON doctor_logs(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_logs_created_at ON doctor_logs(created_at DESC);

COMMENT ON TABLE doctor_logs IS 'Журнал действий врачей';
COMMENT ON COLUMN doctor_logs.action_type IS 'Тип действия (Создание записи, Завершение приема, Отмена записи, Клонирование записи)';
COMMENT ON COLUMN doctor_logs.details IS 'JSON детали действия (пациент, дата, время и т.д.)';