CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.admin_sessions (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    admin_id INTEGER NOT NULL,
    login VARCHAR(100) NOT NULL DEFAULT '',
    source VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON t_p30358746_hospital_website_red.admin_sessions (expires_at);