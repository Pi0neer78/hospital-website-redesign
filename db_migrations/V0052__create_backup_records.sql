CREATE TABLE IF NOT EXISTS "t_p30358746_hospital_website_red".backup_records (
    id SERIAL PRIMARY KEY,
    folder TEXT NOT NULL,
    full_backup BOOLEAN DEFAULT FALSE,
    tables_count INTEGER DEFAULT 0,
    total_rows INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);