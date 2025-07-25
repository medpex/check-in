
# 🎉 QR-Code Scanner Party App

Eine moderne Web-Anwendung zum Verwalten von Gästen und Check-ins bei Veranstaltungen mittels QR-Code-Scanner.

![Party App Banner](https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=200&fit=crop)

## ✨ Features

### 🎫 Gästeverwaltung
- **Gäste hinzufügen** - Neue Gäste mit automatischer QR-Code-Generierung
- **Einladungen erstellen** - QR-Codes für jeden Gast generieren
- **Gästeliste verwalten** - Übersicht aller eingeladenen Gäste
- **Either/Or Gästetypen** - Entweder Familienmitglieder ODER Freunde hinzufügen
- **E-Mail-Versand** - Automatischer E-Mail-Versand für zusätzliche Gäste

### 📱 QR-Code Scanner
- **Live-Scanner** - Echtzeitscanning über die Webcam
- **Check-in/Check-out** - Flexibles Ein- und Auschecken
- **Duplikatschutz** - Verhindert mehrfaches Scannen desselben Codes
- **Live-Feedback** - Sofortige Bestätigung nach erfolgreichem Scan

### 📊 Event-Dashboard
- **Eingecheckte Gäste** - Live-Übersicht aller anwesenden Gäste
- **Scan-Historie** - Letzte gescannte QR-Codes anzeigen
- **Responsive Design** - Funktioniert auf Desktop und Mobile

### ⏰ Zeitlimit-System
- **Konfigurierbare Zeitlimits** - Von 5 Minuten bis zu mehreren Monaten
- **Read-Only Modus** - Automatische Sperrung nach Ablauf
- **Globales Popup** - Prominente Warnung bei Zeitlimit-Ablauf
- **Entwickler-Tools** - Reset und Konfiguration für Tests

## 🚀 Schnellstart mit Docker

### Voraussetzungen

- **Docker** und **Docker Compose**
- **Git** (zum Klonen des Repositories)

### 1-Klick Setup

```bash
# Repository klonen
git clone https://github.com/medpex/check-in.git
cd check-in

# Setup-Script ausführen (empfohlen)
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manueller Start

```bash
# Alle Services starten
docker-compose up -d

# Datenbankmigrationen ausführen
docker-compose exec backend npm run migrate

# Testdaten erstellen
docker-compose exec backend npm run seed
```

### 🌐 Zugriff

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Admin Login**: admin / admin123
- **Zeitlimit**: 5 Minuten (konfigurierbar)

## 🐳 Docker Commands

### Entwicklung
```bash
# Alle Services starten
docker-compose up -d

# Services mit Build
docker-compose up -d --build

# Logs anzeigen
docker-compose logs -f

# Bestimmte Service-Logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Production
```bash
# Production-Modus starten
docker-compose --profile production up -d frontend-prod

# Komplette Production-Stack
docker-compose --profile production up -d
```

### Wartung
```bash
# Services stoppen
docker-compose down

# Alles zurücksetzen (inkl. Datenbank)
docker-compose down -v

# Reset-Script verwenden
./scripts/reset.sh

# Zeitlimit zurücksetzen (für Tests)
docker-compose exec backend curl -X POST http://localhost:3001/api/time-limit/reset -H 'Content-Type: application/json' -d '{"token":"dev_token_123"}'
```

## 🏗️ Technologie Stack

### Frontend
- **React 18** mit **TypeScript**
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** - State Management
- **qr-scanner** - QR-Code Scanning

### Backend
- **Node.js** mit **Express**
- **PostgreSQL** - Datenbank
- **qrcode** - QR-Code Generierung
- **CORS** & **Helmet** - Sicherheit

### 🐳 Containerization
- **Docker** & **Docker Compose**
- **Multi-Stage Builds** für optimierte Images
- **Nginx** für Production
- **Health Checks** für Service-Monitoring

## 📊 API Endpunkte

### Gäste
- `GET /api/guests` - Alle Gäste abrufen
- `POST /api/guests` - Neuen Gast erstellen
- `DELETE /api/guests/:id` - Gast löschen

### Check-ins
- `GET /api/checkins` - Eingecheckte Gäste abrufen
- `POST /api/checkins` - Gast einchecken
- `DELETE /api/checkins/:guest_id` - Gast auschecken

### Health Check
- `GET /api/health` - Service-Status prüfen

## 🔧 Entwicklung

### Lokale Entwicklung ohne Docker

```bash
# Frontend
npm install
npm run dev

# Backend (separates Terminal)
cd backend
npm install
npm run dev
```

### Database Management

```bash
# Migrationen ausführen
docker-compose exec backend npm run migrate

# Testdaten erstellen
docker-compose exec backend npm run seed

# Datenbank-Shell öffnen
docker-compose exec postgres psql -U qr_scanner_user -d qr_scanner_db
```

## 🐛 Troubleshooting

### Port-Konflikte
```bash
# Andere Ports verwenden
FRONTEND_PORT=3000 BACKEND_PORT=3002 docker-compose up
```

### Container neu starten
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Logs prüfen
```bash
# Alle Logs
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs postgres
```

### Datenbank-Probleme
```bash
# Datenbank zurücksetzen
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

## 📱 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/600x400/6366f1/ffffff?text=Dashboard+Screenshot)

### QR-Scanner
![Scanner](https://via.placeholder.com/600x400/10b981/ffffff?text=Scanner+Screenshot)

## ⏰ Zeitlimit-Konfiguration

### Standard-Einstellungen
```bash
# .env Datei anpassen
TIME_LIMIT_MINUTES=5          # 5 Minuten (Standard für Tests)
DEVELOPER_TOKEN=dev_token_123 # Token für Reset/Configure
```

### Zeitlimit-Beispiele
```bash
TIME_LIMIT_MINUTES=5          # 5 Minuten (Tests)
TIME_LIMIT_MINUTES=20         # 20 Minuten
TIME_LIMIT_MINUTES=60         # 1 Stunde
TIME_LIMIT_MINUTES=1440       # 1 Tag
TIME_LIMIT_MINUTES=131400     # 3 Monate
TIME_LIMIT_MINUTES=525600     # 1 Jahr
```

### Zeitlimit verwalten
```bash
# Status prüfen
curl http://localhost:3001/api/time-limit/status

# Zeitlimit zurücksetzen (nur mit Token)
curl -X POST http://localhost:3001/api/time-limit/reset \
  -H 'Content-Type: application/json' \
  -d '{"token":"dev_token_123"}'

# Zeitlimit konfigurieren (nur mit Token)
curl -X POST http://localhost:3001/api/time-limit/configure \
  -H 'Content-Type: application/json' \
  -d '{"token":"dev_token_123","minutes":30}'
```

## 🔒 Sicherheit

- **CORS**-Schutz für API-Zugriff
- **Helmet.js** für Security Headers
- **SQL Injection**-Schutz durch Parameter-Queries
- **UUID**-basierte IDs für sichere Referenzen
- **Zeitlimit-System** für kontrollierte Nutzung

## 🚀 Deployment

### Docker Hub
```bash
# Images taggen und pushen
docker tag qr-scanner-app:latest username/qr-scanner-app:latest
docker push username/qr-scanner-app:latest
```

### Production Environment
```bash
# Production-Build erstellen
docker-compose --profile production build

# Production starten
docker-compose --profile production up -d
```

## 📈 Performance

- **Multi-Stage Docker Builds** für kleinere Images
- **Connection Pooling** für Datenbankzugriffe
- **Nginx** als Reverse Proxy in Production
- **Health Checks** für Service-Monitoring

## 🤝 Beitragen

1. Fork das Repository
2. Feature Branch erstellen
3. Änderungen committen
4. Pull Request öffnen

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei.

---

⭐ **Gefällt dir das Projekt?** Gib uns einen Stern auf GitHub!

**Entwickelt mit Docker** 🐳 **für maximale Portabilität**
