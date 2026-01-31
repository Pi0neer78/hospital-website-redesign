-- Таблица для ежедневного расписания врачей (вместо недельного шаблона)
CREATE TABLE IF NOT EXISTS daily_schedules (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id),
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start_time TIME,
  break_end_time TIME,
  slot_duration INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, schedule_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_schedules_doctor_date ON daily_schedules(doctor_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_daily_schedules_date_range ON daily_schedules(schedule_date) WHERE is_active = true;