CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.staff_sessions (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    user_id INTEGER NOT NULL,
    login VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_sessions_expires ON t_p30358746_hospital_website_red.staff_sessions (expires_at);