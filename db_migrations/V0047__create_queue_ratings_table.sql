CREATE TABLE t_p30358746_hospital_website_red.queue_ratings (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER,
  patient_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);