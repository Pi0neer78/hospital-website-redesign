CREATE TABLE IF NOT EXISTS user_questions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    question TEXT NOT NULL CHECK (LENGTH(question) <= 200),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_questions_status ON user_questions(status, created_at DESC);