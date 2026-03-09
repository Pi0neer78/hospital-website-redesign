CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.gallery_images (
    id SERIAL PRIMARY KEY,
    section_number INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 9),
    image_url TEXT NOT NULL,
    file_key TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p30358746_hospital_website_red.gallery_settings (
    id SERIAL PRIMARY KEY,
    section_number INTEGER NOT NULL UNIQUE CHECK (section_number BETWEEN 1 AND 9),
    slide_delay INTEGER NOT NULL DEFAULT 5 CHECK (slide_delay BETWEEN 1 AND 30),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p30358746_hospital_website_red.gallery_settings (section_number, slide_delay)
VALUES (1,5),(2,5),(3,5),(4,5),(5,5),(6,5),(7,5),(8,5),(9,5)
ON CONFLICT (section_number) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_gallery_images_section ON t_p30358746_hospital_website_red.gallery_images(section_number);
