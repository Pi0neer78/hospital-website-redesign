CREATE TABLE IF NOT EXISTS "t_p30358746_hospital_website_red".id_codes (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);