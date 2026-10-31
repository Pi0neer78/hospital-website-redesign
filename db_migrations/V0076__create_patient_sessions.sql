CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.patient_sessions (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    phone_last10 VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patient_sessions_expires ON t_p30358746_hospital_website_red.patient_sessions (expires_at);