CREATE TABLE infowall_sections (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE infowall_topics (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES infowall_sections(id),
  title VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE infowall_posts (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES infowall_topics(id),
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
