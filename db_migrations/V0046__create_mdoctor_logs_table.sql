CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.mdoctor_logs (
    id SERIAL PRIMARY KEY,
    admin_login VARCHAR(255),
    action_type VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    computer_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);