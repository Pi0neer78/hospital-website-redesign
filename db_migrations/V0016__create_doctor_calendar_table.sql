-- Таблица для календаря врача с отметками рабочих/выходных дней
CREATE TABLE IF NOT EXISTS doctor_calendar (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    calendar_date DATE NOT NULL,
    is_working BOOLEAN NOT NULL DEFAULT true,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, calendar_date)
);

CREATE INDEX IF NOT EXISTS idx_doctor_calendar_doctor_date ON doctor_calendar(doctor_id, calendar_date);
CREATE INDEX IF NOT EXISTS idx_doctor_calendar_date ON doctor_calendar(calendar_date);

COMMENT ON TABLE doctor_calendar IS 'Календарь врача с отметками рабочих/выходных дней (имеет приоритет над расписанием)';
COMMENT ON COLUMN doctor_calendar.is_working IS 'true - рабочий день, false - выходной/отпуск';
COMMENT ON COLUMN doctor_calendar.note IS 'Заметка (например: отпуск, командировка, больничный)';
