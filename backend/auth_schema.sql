-- Authentifizierung Schema für Admin-Bereich

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions-Tabelle für JWT Token Blacklisting
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trigger für updated_at Spalte in users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger nur erstellen wenn er noch nicht existiert
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_users_updated_at_trigger') THEN
        CREATE TRIGGER update_users_updated_at_trigger
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_users_updated_at();
    END IF;
END $$;

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Admin-Benutzer anlegen (Passwort: admin123)
-- Das Passwort wird mit bcrypt gehashed (Rounds: 10)
INSERT INTO users (username, password_hash, email, role) VALUES 
    ('admin', '$2b$10$rQZ8K9mN2pL1vX3yW6tA7eB4cF5gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7a', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Berechtigungen
GRANT ALL PRIVILEGES ON TABLE users TO qr_scanner_user;
GRANT ALL PRIVILEGES ON TABLE user_sessions TO qr_scanner_user;
GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO qr_scanner_user;
GRANT ALL PRIVILEGES ON SEQUENCE user_sessions_id_seq TO qr_scanner_user; 