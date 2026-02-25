CREATE TABLE IF NOT EXISTS "t_p30358746_hospital_website_red".backup_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    start_time TIME NOT NULL DEFAULT '02:00:00',
    end_time TIME NOT NULL DEFAULT '04:00:00',
    repeat_minutes INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO "t_p30358746_hospital_website_red".backup_settings (id, enabled, start_time, end_time, repeat_minutes)
VALUES (1, FALSE, '02:00:00', '04:00:00', 0)
ON CONFLICT (id) DO NOTHING;
