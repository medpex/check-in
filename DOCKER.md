
# 🐳 Docker Setup für QR-Scanner App

Diese Anleitung erklärt, wie du die QR-Scanner App mit Docker entwickeln und deployen kannst.

## 🚀 Schnellstart

### Development mit Docker Compose

```bash
# App im Development-Modus starten
docker-compose up

# Im Hintergrund starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down
```

Die App ist dann unter `http://localhost:8080` erreichbar.

### Production Build

```bash
# Production-Container erstellen und starten
docker-compose --profile production up qr-scanner-prod

# Oder manuell:
docker build -t qr-scanner-app --target production .
docker run -p 80:80 qr-scanner-app
```

## 📋 Verfügbare Docker Commands

### Development
```bash
# Development-Container starten
docker-compose up

# Container neu bauen
docker-compose up --build

# Nur den App-Service starten
docker-compose up qr-scanner-app
```

### Production
```bash
# Production-Image erstellen
docker build -t qr-scanner-app:latest --target production .

# Production-Container starten
docker run -d -p 80:80 --name qr-scanner qr-scanner-app:latest

# Container stoppen und entfernen
docker stop qr-scanner && docker rm qr-scanner
```

### Debugging
```bash
# Container-Shell öffnen
docker-compose exec qr-scanner-app sh

# Container-Logs anzeigen
docker-compose logs qr-scanner-app

# Container neu starten
docker-compose restart qr-scanner-app
```

## 🔧 Konfiguration

### Environment Variables

Erstelle eine `.env` Datei für lokale Entwicklung:

```bash
# .env
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### Docker Compose Override

Für lokale Anpassungen erstelle `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  qr-scanner-app:
    environment:
      - VITE_API_URL=http://your-api-url:3001/api
    ports:
      - "3000:8080"  # Anderen Port verwenden
```

## 📦 Multi-Stage Build Erklärung

Das Dockerfile verwendet Multi-Stage Build für optimale Performance:

1. **Base Stage** - Node.js Setup und Dependencies
2. **Development Stage** - Für lokale Entwicklung mit Hot Reload
3. **Build Stage** - Erstellt Production Build
4. **Production Stage** - Nginx serviert statische Dateien

## 🚀 Deployment

### Docker Hub
```bash
# Image taggen
docker tag qr-scanner-app:latest username/qr-scanner-app:latest

# Image pushen
docker push username/qr-scanner-app:latest
```

### Verschiedene Plattformen
```bash
# Multi-Platform Build (ARM64 + AMD64)
docker buildx build --platform linux/amd64,linux/arm64 -t username/qr-scanner-app:latest --push .
```

## 🔍 Troubleshooting

### Häufige Probleme

**Port bereits belegt:**
```bash
# Anderen Port verwenden
docker-compose up -p 3000:8080 qr-scanner-app
```

**Container startet nicht:**
```bash
# Logs prüfen
docker-compose logs qr-scanner-app

# Container-Status prüfen
docker-compose ps
```

**Hot Reload funktioniert nicht:**
```bash
# Volume-Mapping prüfen
docker-compose down -v
docker-compose up --build
```

**Kamera-Zugriff funktioniert nicht:**
- Docker Container benötigt HTTPS für Kamera-Zugriff
- Nutze einen Reverse Proxy mit SSL für Production

### Performance Optimierung

**Image-Größe reduzieren:**
- Nutze `.dockerignore` für unnötige Dateien
- Multi-stage Build minimiert finale Image-Größe
- Alpine Linux Images sind kleiner

**Build-Zeit optimieren:**
- Dependencies werden separat kopiert für besseres Caching
- `.dockerignore` verhindert unnötige Transfers

## 📚 Weitere Ressourcen

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
