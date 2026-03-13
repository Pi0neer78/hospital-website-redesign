CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.doctor_ratings (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    ip_address VARCHAR(45),
    user_agent TEXT,
    fingerprint VARCHAR(255),
    voted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_ratings_doctor_id ON t_p30358746_hospital_website_red.doctor_ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_ip ON t_p30358746_hospital_website_red.doctor_ratings(ip_address, doctor_id, voted_at);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_fingerprint ON t_p30358746_hospital_website_red.doctor_ratings(fingerprint, doctor_id, voted_at);
