
CREATE TABLE t_p30358746_hospital_website_red.reest_phone_max (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    source_type VARCHAR(20) NOT NULL DEFAULT 'complaint',
    complaint_date TIMESTAMP,
    appointment_date TIMESTAMP,
    last_email_text TEXT,
    last_email_sent_at TIMESTAMP,
    last_max_text TEXT,
    last_max_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_reest_phone UNIQUE (phone),
    CONSTRAINT uq_reest_email UNIQUE (email)
);

CREATE INDEX idx_reest_phone_max_phone ON t_p30358746_hospital_website_red.reest_phone_max (phone);
CREATE INDEX idx_reest_phone_max_email ON t_p30358746_hospital_website_red.reest_phone_max (email);
