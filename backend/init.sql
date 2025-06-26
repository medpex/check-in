
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

-- SMTP Konfiguration Tabelle
CREATE TABLE IF NOT EXISTS smtp_config (
    id SERIAL PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN NOT NULL DEFAULT false,
    user VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_main_guest_id ON guests(main_guest_id);
CREATE INDEX IF NOT EXISTS idx_guests_guest_type ON guests(guest_type);
CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON checkins(guest_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON checkins(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_business_emails_email ON business_emails(email);

-- Beispiel-Daten für berechtigte Geschäftsemails (optional)
INSERT INTO business_emails (email, company) VALUES 
    ('admin@example.com', 'Beispiel GmbH'),
    ('hr@company.com', 'Firma AG')
ON CONFLICT (email) DO NOTHING;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO qr_scanner_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO qr_scanner_user;
