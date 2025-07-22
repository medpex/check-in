
-- Datenbank-Schema für QR Scanner Party App

-- Gäste-Tabelle erstellen oder erweitern
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    qr_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Neue Spalten hinzufügen falls sie noch nicht existieren
DO $$ 
BEGIN 
    -- main_guest_id Spalte hinzufügen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='guests' AND column_name='main_guest_id') THEN
        ALTER TABLE guests ADD COLUMN main_guest_id UUID;
    END IF;
    
    -- guest_type Spalte hinzufügen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='guests' AND column_name='guest_type') THEN
        ALTER TABLE guests ADD COLUMN guest_type VARCHAR(50);
    END IF;
    
    -- email_sent Spalte hinzufügen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='guests' AND column_name='email_sent') THEN
        ALTER TABLE guests ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- email_sent_at Spalte hinzufügen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='guests' AND column_name='email_sent_at') THEN
        ALTER TABLE guests ADD COLUMN email_sent_at TIMESTAMP;
    END IF;
END $$;

-- Foreign Key Constraint hinzufügen (nur wenn noch nicht vorhanden)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='guests_main_guest_id_fkey') THEN
        ALTER TABLE guests ADD CONSTRAINT guests_main_guest_id_fkey 
        FOREIGN KEY (main_guest_id) REFERENCES guests(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ... keep existing code (Check-ins Tabelle, Berechtigte Geschäftsemails Tabelle, SMTP Konfiguration Tabelle, Trigger, Spalten erweitern)

-- Check-ins Tabelle
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    guest_id UUID NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_out_at TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

-- Berechtigte Geschäftsemails Tabelle
CREATE TABLE IF NOT EXISTS business_emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Neue Spalten zu business_emails hinzufügen, falls sie noch nicht existieren
DO $$ 
BEGIN 
    -- email_sent Spalte hinzufügen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='business_emails' AND column_name='email_sent') THEN
        ALTER TABLE business_emails ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
    END IF;
    -- email_sent_at Spalte hinzufügen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='business_emails' AND column_name='email_sent_at') THEN
        ALTER TABLE business_emails ADD COLUMN email_sent_at TIMESTAMP;
    END IF;
END $$;

-- SMTP Konfiguration Tabelle - ERWEITERT für bessere Kompatibilität
CREATE TABLE IF NOT EXISTS smtp_config (
    id SERIAL PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN NOT NULL DEFAULT false,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger für updated_at Spalte in smtp_config
CREATE OR REPLACE FUNCTION update_smtp_config_updated_at()
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
                   WHERE trigger_name = 'update_smtp_config_updated_at_trigger') THEN
        CREATE TRIGGER update_smtp_config_updated_at_trigger
            BEFORE UPDATE ON smtp_config
            FOR EACH ROW
            EXECUTE FUNCTION update_smtp_config_updated_at();
    END IF;
END $$;

-- Sicherstellen, dass alle SMTP Spalten die richtige Größe haben
DO $$
BEGIN
    -- host Spalte auf 500 Zeichen erweitern falls nötig
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='smtp_config' AND column_name='host' 
               AND character_maximum_length < 500) THEN
        ALTER TABLE smtp_config ALTER COLUMN host TYPE VARCHAR(500);
    END IF;
    
    -- username Spalte auf 500 Zeichen erweitern falls nötig
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='smtp_config' AND column_name='username' 
               AND character_maximum_length < 500) THEN
        ALTER TABLE smtp_config ALTER COLUMN username TYPE VARCHAR(500);
    END IF;
    
    -- from_name Spalte auf 500 Zeichen erweitern falls nötig
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='smtp_config' AND column_name='from_name' 
               AND character_maximum_length < 500) THEN
        ALTER TABLE smtp_config ALTER COLUMN from_name TYPE VARCHAR(500);
    END IF;
    
    -- from_email Spalte auf 500 Zeichen erweitern falls nötig
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='smtp_config' AND column_name='from_email' 
               AND character_maximum_length < 500) THEN
        ALTER TABLE smtp_config ALTER COLUMN from_email TYPE VARCHAR(500);
    END IF;
END $$;

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_main_guest_id ON guests(main_guest_id);
CREATE INDEX IF NOT EXISTS idx_guests_guest_type ON guests(guest_type);
CREATE INDEX IF NOT EXISTS idx_guests_email_sent ON guests(email_sent);
CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON checkins(guest_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON checkins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_business_emails_email ON business_emails(email);
CREATE INDEX IF NOT EXISTS idx_smtp_config_created_at ON smtp_config(created_at);

-- Beispiel-Daten für berechtigte Geschäftsemails (optional)
INSERT INTO business_emails (email, company) VALUES 
    ('admin@example.com', 'Beispiel GmbH'),
    ('hr@company.com', 'Firma AG')
ON CONFLICT (email) DO NOTHING;

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
-- Hash für "admin123" mit bcrypt
INSERT INTO users (username, password_hash, email, role) VALUES 
    ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Berechtigungen
GRANT ALL PRIVILEGES ON TABLE users TO qr_scanner_user;
GRANT ALL PRIVILEGES ON TABLE user_sessions TO qr_scanner_user;
GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO qr_scanner_user;
GRANT ALL PRIVILEGES ON SEQUENCE user_sessions_id_seq TO qr_scanner_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO qr_scanner_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO qr_scanner_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO qr_scanner_user;
