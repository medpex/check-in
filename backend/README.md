
# 🎉 QR-Scanner Party Backend

Backend API für die QR-Scanner Party App mit Node.js, Express und PostgreSQL.

## 🚀 Schnellstart

### Mit Docker (Empfohlen)

```bash
# In das Backend-Verzeichnis wechseln
cd backend

# Alle Services starten (PostgreSQL + API)
docker-compose up -d

# Datenbankmigrationen ausführen
docker-compose exec api npm run migrate

# Testdaten erstellen (optional)
docker-compose exec api npm run seed

# Logs anzeigen
docker-compose logs -f api
```

### Lokale Installation

```bash
# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# .env bearbeiten mit deinen Datenbankdaten

# PostgreSQL-Datenbank erstellen
createdb qr_scanner_db

# Migrationen ausführen
npm run migrate

# Testdaten erstellen (optional)
npm run seed

# Server starten
npm run dev
```

## 📡 API Endpunkte

### Gäste (Guests)

**GET `/api/guests`**
- Gibt alle Gäste zurück
- Response: `Guest[]`

**POST `/api/guests`**
- Erstellt einen neuen Gast mit QR-Code
- Body: `{ "name": "string", "email": "string" }`
- Response: `Guest`

**DELETE `/api/guests/:id`**
- Löscht einen Gast
- Response: Status 200

### Check-ins

**GET `/api/checkins`**
- Gibt alle eingecheckten Gäste zurück
- Response: `CheckedInGuest[]`

**POST `/api/checkins`**
- Checkt einen Gast ein
- Body: `{ "guest_id": "string", "name": "string", "timestamp": "ISO-string" }`
- Response: `CheckedInGuest`
- Error 409: Falls Gast bereits eingecheckt

**DELETE `/api/checkins/:guest_id`**
- Checkt einen Gast aus
- Response: Status 200
- Error 404: Falls Gast nicht eingecheckt

### Health Check

**GET `/api/health`**
- Server-Status prüfen
- Response: `{ "status": "OK", "timestamp": "ISO-string" }`

## 🗄️ Datenbankschema

```sql
-- Gäste Tabelle
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  qr_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins Tabelle
CREATE TABLE checkins (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  UNIQUE(guest_id) -- Verhindert doppelte Check-ins
);
```

## 🐳 Docker Commands

```bash
# Services starten
docker-compose up -d

# Services stoppen
docker-compose down

# Logs anzeigen
docker-compose logs -f

# Container neu bauen
docker-compose up --build

# Datenbank zurücksetzen
docker-compose down -v
docker-compose up -d postgres
docker-compose exec api npm run migrate
```

## 🔧 Entwicklung

```bash
# Development Server mit Hot Reload
npm run dev

# Produktionsserver
npm start

# Migrationen ausführen
npm run migrate

# Testdaten erstellen
npm run seed
```

## 🌐 Umgebungsvariablen

```env
# Datenbank
DATABASE_URL=postgresql://user:password@localhost:5432/qr_scanner_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qr_scanner_db
DB_USER=qr_scanner_user
DB_PASSWORD=your_password

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:8080
```

## 📊 QR-Code Format

Die QR-Codes enthalten JSON-Daten:
```json
{
  "id": "guest-uuid",
  "name": "Gast Name"
}
```

## 🔒 Sicherheit

- CORS-Schutz für Frontend-Integration
- SQL-Injection-Schutz durch Parameter-Queries
- Helmet.js für Security Headers
- UUID für sichere IDs
- Eingabevalidierung für alle Endpunkte

## 🐛 Troubleshooting

**Datenbankverbindung fehlgeschlagen:**
```bash
# PostgreSQL-Status prüfen
docker-compose ps postgres

# Logs anzeigen
docker-compose logs postgres
```

**Port bereits belegt:**
```bash
# Anderen Port in .env konfigurieren
PORT=3002
```

**Migrationen fehlgeschlagen:**
```bash
# Container neu starten
docker-compose restart api
docker-compose exec api npm run migrate
```

## 📈 Performance

- Datenbankindizes für häufige Abfragen
- Connection Pooling mit pg
- Effiziente SQL-Queries
- Minimale Dependencies

Der Backend-Server läuft unter `http://localhost:3001` und ist bereit für die Frontend-Integration!
