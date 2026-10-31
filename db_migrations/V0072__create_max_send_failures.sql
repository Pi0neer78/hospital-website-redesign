CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.max_send_failures (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    phone_masked VARCHAR(30) NOT NULL DEFAULT '',
    problem TEXT NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '',
    request_id VARCHAR(64) NOT NULL DEFAULT '',
    emailed_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_max_send_failures_pending ON t_p30358746_hospital_website_red.max_send_failures (emailed_at, created_at);