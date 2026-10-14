CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    icon VARCHAR(50) DEFAULT 'Building2',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p30358746_hospital_website_red.clinics (name, description, icon, sort_order) VALUES
('Центральная городская поликлиника', 'Приём взрослого населения', 'Building2', 1),
('Детская городская поликлиника', 'Приём детей', 'Baby', 2),
('Женская консультация', 'Наблюдение беременности и женское здоровье', 'HeartPulse', 3)
ON CONFLICT (name) DO NOTHING;