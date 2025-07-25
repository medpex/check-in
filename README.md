
# QR Scanner Party App

Eine moderne Web-Anwendung für die Verwaltung von Gästen und Check-ins bei Veranstaltungen mit QR-Code-Scanning.

## 🚀 Features

- **QR-Code-Generierung**: Automatische Erstellung von QR-Codes für jeden Gast
- **Check-in/Check-out System**: Einfache An- und Abmeldung von Gästen
- **Gästeverwaltung**: Vollständige CRUD-Operationen für Gäste
- **Benutzer-Management**: Admin- und Scanner-Rollen mit verschiedenen Berechtigungen
- **E-Mail-Versand**: Automatische E-Mail-Benachrichtigungen für Gäste
- **Formular-Customizing**: Anpassbare Hintergrundfarben und Logos
- **Zeitlimit-System**: Konfigurierbare Laufzeitbegrenzung mit Read-Only-Modus
- **Either/Or Gästetypen**: Entweder Familienmitglieder ODER Freunde hinzufügen
- **E-Mail-Versand**: SMTP-Konfiguration mit optionaler Authentifizierung

## 🔧 Konfiguration

Die App-URL kann einfach angepasst werden:

```bash
# In der .env Datei oder als Umgebungsvariable
APP_BASE_URL=https://ihre-domain.de
```

**Standard**: `https://check-in.home-ki.eu`

### SMTP-Konfiguration

Das System unterstützt SMTP-Server mit und ohne Authentifizierung:

#### **Mit Authentifizierung (Standard):**
- Host: `smtp.gmail.com`
- Port: `587`
- Benutzername: `ihre-email@gmail.com`
- Passwort: `ihr-app-passwort`

#### **Ohne Authentifizierung (lokale SMTP-Server):**
- Host: `localhost` oder `127.0.0.1`
- Port: `25` (Standard SMTP-Port)
- Benutzername: **leer lassen**
- Passwort: **leer lassen**

**Hinweis**: Bei SMTP-Servern ohne Authentifizierung können die Felder "Benutzername" und "Passwort" leer gelassen werden. Das System erkennt automatisch, ob Authentifizierung erforderlich ist.

## 🌐 Zugriff

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Admin Login**: admin / admin123
- **Zeitlimit**: 5 Minuten (konfigurierbar)

## 🛠️ Installation

### Voraussetzungen

- Docker und Docker Compose
- Git

### Schnellstart

```bash
# Repository klonen
git clone <repository-url>
cd qrcode-feier-checkin

# Setup ausführen
chmod +x scripts/setup.sh
./scripts/setup.sh

# Anwendung starten
docker compose up -d
```

### Manuelle Installation

```bash
# 1. Repository klonen
git clone <repository-url>
cd qrcode-feier-checkin

# 2. Umgebungsvariablen konfigurieren
cp env.example .env
# .env Datei anpassen

# 3. Docker-Container starten
docker compose up -d

# 4. Datenbank initialisieren (automatisch beim ersten Start)
```

## 📧 E-Mail-Konfiguration

### SMTP-Einstellungen

1. **Admin-Bereich öffnen**: http://localhost:8080/admin
2. **Einstellungen → SMTP-Konfiguration**
3. **Konfiguration eingeben**:
   - **SMTP-Server**: z.B. `smtp.gmail.com`
   - **Port**: z.B. `587`
   - **Sichere Verbindung**: Aktivieren für SSL/TLS
   - **Benutzername**: Ihre E-Mail-Adresse (optional)
   - **Passwort**: Ihr App-Passwort (optional)
   - **Absender-Name**: z.B. "Event Team"
   - **Absender-E-Mail**: z.B. `event@ihre-domain.com`

### Testen der E-Mail-Konfiguration

1. **Verbindung testen**: Klicken Sie auf "Verbindung testen"
2. **Test-E-Mail senden**: Geben Sie eine Test-E-Mail-Adresse ein
3. **Konfiguration speichern**: Klicken Sie auf "Speichern"

### Lokale SMTP-Server

Für lokale SMTP-Server (z.B. Postfix, Exchange) können die Authentifizierungsfelder leer gelassen werden:

```
Host: localhost
Port: 25
Benutzername: (leer lassen)
Passwort: (leer lassen)
```

## 🔐 Sicherheit

- **JWT-Token-basierte Authentifizierung**
- **Bcrypt-Passwort-Hashing**
- **CORS-Konfiguration**
- **Zeitlimit-System** mit Read-Only-Modus
- **Umgebungsvariablen** für sensible Daten

## 🗄️ Datenbank

### Tabellen

- `guests`: Gästedaten mit QR-Codes
- `checkins`: Check-in/Check-out-Logs
- `users`: Benutzer und Rollen
- `business_emails`: Berechtigte Geschäfts-E-Mails
- `form_settings`: Formular-Customizing
- `smtp_config`: E-Mail-Server-Konfiguration
- `install_info`: Installations- und Zeitlimit-Daten

### Backup

```bash
# Datenbank-Backup erstellen
docker compose exec postgres pg_dump -U qr_scanner_user qr_scanner_db > backup.sql

# Backup wiederherstellen
docker compose exec -T postgres psql -U qr_scanner_user qr_scanner_db < backup.sql
```

## 🚀 Deployment

### Produktionsumgebung

1. **Umgebungsvariablen anpassen**:
   ```bash
   APP_BASE_URL=https://ihre-domain.de
   TIME_LIMIT_MINUTES=43200  # 30 Tage
   DEVELOPER_TOKEN=ihr-sicherer-token
   ```

2. **Docker-Container starten**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. **Reverse Proxy konfigurieren** (Nginx/Apache)

### SSL/HTTPS

```nginx
server {
    listen 443 ssl;
    server_name ihre-domain.de;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠️ Wartung

### Logs anzeigen

```bash
# Alle Container
docker compose logs

# Spezifischer Container
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

### Container neustarten

```bash
# Alle Container
docker compose restart

# Spezifischer Container
docker compose restart backend
```

### Datenbank zurücksetzen

```bash
# Volumes löschen (ACHTUNG: Alle Daten gehen verloren!)
docker compose down -v
docker compose up -d
```

### Zeitlimit zurücksetzen (für Tests)

```bash
curl -X POST http://localhost:3001/api/time-limit/reset \
  -H "Authorization: Bearer dev_token_123" \
  -H "Content-Type: application/json"
```

## 📊 API-Endpunkte

### Öffentliche Endpunkte

- `GET /api/time-limit/status` - Zeitlimit-Status
- `GET /api/guests/additional-guests` - Zusätzliche Gäste laden

### Geschützte Endpunkte

- `POST /api/auth/login` - Benutzer-Anmeldung
- `GET /api/guests` - Gäste auflisten
- `POST /api/guests` - Neuen Gast erstellen
- `PUT /api/guests/:id` - Gast aktualisieren
- `DELETE /api/guests/:id` - Gast löschen
- `POST /api/checkins` - Check-in/Check-out
- `GET /api/settings/smtp` - SMTP-Konfiguration abrufen
- `POST /api/settings/smtp` - SMTP-Konfiguration speichern
- `POST /api/smtp/test` - SMTP-Verbindung testen

## 🐛 Troubleshooting

### Häufige Probleme

1. **Container startet nicht**:
   ```bash
   docker compose logs
   docker system prune -a
   ```

2. **Datenbank-Verbindungsfehler**:
   ```bash
   docker compose restart postgres
   docker compose exec postgres psql -U qr_scanner_user -d qr_scanner_db
   ```

3. **E-Mail-Versand funktioniert nicht**:
   - SMTP-Konfiguration prüfen
   - Firewall-Einstellungen kontrollieren
   - Test-E-Mail senden

4. **Zeitlimit-Popup erscheint nicht**:
   ```bash
   # Zeitlimit zurücksetzen
   curl -X POST http://localhost:3001/api/time-limit/reset \
     -H "Authorization: Bearer dev_token_123"
   ```

### Debug-Modus

```bash
# Backend-Logs mit Debug-Informationen
docker compose logs -f backend

# Frontend-Logs
docker compose logs -f frontend
```

## 📝 Changelog

### Version 1.0.0
- ✅ QR-Code-Generierung und -Scanning
- ✅ Gästeverwaltung mit CRUD-Operationen
- ✅ Check-in/Check-out-System
- ✅ Benutzer-Management mit Rollen
- ✅ E-Mail-Versand mit SMTP-Konfiguration
- ✅ Formular-Customizing
- ✅ Zeitlimit-System mit Read-Only-Modus
- ✅ Either/Or Gästetypen-Logik
- ✅ SMTP ohne Authentifizierung
- ✅ Zentrale App-URL-Konfiguration

## 📄 Lizenz

Dieses Projekt ist proprietär und nicht zur Weiterverbreitung bestimmt.

## 🤝 Support

Bei Fragen oder Problemen wenden Sie sich an den Entwickler.

---

**Entwickelt mit ❤️ für moderne Event-Management-Lösungen**
