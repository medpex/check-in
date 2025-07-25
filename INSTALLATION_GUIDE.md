# 🚀 QR-Code Check-In System - Installationsanleitung

## 📋 Voraussetzungen

- **Docker** und **Docker Compose** installiert
- **Git** installiert
- Mindestens **2GB RAM** verfügbar
- **Ports 80, 8080, 3001, 5432** verfügbar

## 🔧 Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd qrcode-feier-checkin
```

### 2. Umgebungsvariablen konfigurieren
```bash
# .env Datei erstellen
cp .env.example .env

# Zeitlimit anpassen (optional, Standard: 5 Minuten)
echo "TIME_LIMIT_MINUTES=5" > .env
```

### 3. System starten
```bash
# Alle Container bauen und starten
docker compose up -d

# Status prüfen
docker compose ps
```

### 4. System testen
```bash
# Frontend testen
curl http://localhost:8080

# Backend API testen
curl http://localhost:3001/api/health

# Zeitlimit-Status prüfen
curl http://localhost:3001/api/time-limit/status
```

## 🔐 Initiale Zugangsdaten

**Automatisch eingerichtet beim ersten Start:**

```
Benutzername: admin
Passwort: admin123
E-Mail: admin@example.com
Rolle: Administrator
```

## 🌐 Zugriff auf die Anwendung

- **Frontend (Benutzer)**: `http://localhost:8080`
- **Backend API**: `http://localhost:3001/api`
- **Admin-Bereich**: Über das Frontend mit Admin-Zugangsdaten

## ⏰ Zeitlimit-Konfiguration

Das System hat ein konfigurierbares Zeitlimit:

```bash
# Zeitlimit auf 30 Minuten setzen
echo "TIME_LIMIT_MINUTES=30" > .env
docker compose restart backend

# Zeitlimit auf 3 Monate setzen
echo "TIME_LIMIT_MINUTES=131400" > .env  # 3 Monate = 90 Tage * 24h * 60min
docker compose restart backend
```

## 🔧 Wartung

### Logs anzeigen
```bash
# Alle Logs
docker compose logs

# Backend Logs
docker compose logs backend

# Frontend Logs
docker compose logs frontend
```

### System neustarten
```bash
docker compose restart
```

### System komplett neu aufbauen
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Datenbank-Backup
```bash
docker exec qrcode-feier-checkin-postgres-1 pg_dump -U qr_scanner_user qr_scanner_db > backup.sql
```

### Datenbank wiederherstellen
```bash
docker exec -i qrcode-feier-checkin-postgres-1 psql -U qr_scanner_user qr_scanner_db < backup.sql
```

## 🚨 Zeitlimit abgelaufen

Wenn das Zeitlimit abgelaufen ist:

1. **Popup erscheint** automatisch im Frontend
2. **Read-Only Modus** wird aktiviert
3. **Eingaben werden blockiert**

### Zeitlimit zurücksetzen (nur für Tests)
```bash
# Zeitlimit zurücksetzen
docker exec qrcode-feier-checkin-postgres-1 psql -U qr_scanner_user -d qr_scanner_db -c "DELETE FROM install_info; INSERT INTO install_info (installed_at, version) VALUES (NOW(), '1.0.0');"
```

## 🔒 Sicherheit

### Standard-Passwort ändern
Nach der ersten Anmeldung sollten Sie das Admin-Passwort ändern:

1. Im Frontend anmelden (admin/admin123)
2. Passwort über die Benutzeroberfläche ändern

### Firewall-Konfiguration
```bash
# Nur notwendige Ports öffnen
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (falls SSL konfiguriert)
sudo ufw enable
```

## 📞 Support

Bei Problemen:

1. **Logs prüfen**: `docker compose logs`
2. **System-Status**: `docker compose ps`
3. **Health Check**: `curl http://localhost:3001/api/health`
4. **Entwickler kontaktieren** mit Logs und Fehlermeldungen

## 🎯 Produktionsumgebung

Für die Produktionsumgebung:

1. **SSL/HTTPS** konfigurieren
2. **Domain** einrichten
3. **Backup-Strategie** implementieren
4. **Monitoring** einrichten
5. **Firewall** konfigurieren

---

**Wichtig**: Das System richtet sich automatisch beim ersten Start ein. Die initialen Zugangsdaten sind immer `admin/admin123`. 