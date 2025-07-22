#!/bin/bash

# QR Scanner Party App - Build mit Authentifizierung
echo "🔐 QR Scanner Party App - Build mit Authentifizierung"
echo "======================================================"

# Prüfe ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert."
    exit 1
fi

# Prüfe ob Docker Compose verfügbar ist
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose ist nicht installiert."
    exit 1
fi

echo "🛑 Stoppe alte Container..."
$COMPOSE_CMD down

echo "🐳 Baue Container neu..."
$COMPOSE_CMD build --no-cache

echo "🚀 Starte Container..."
$COMPOSE_CMD up -d

echo "⏳ Warte auf Datenbank..."
sleep 10

echo "🔐 Erstelle Admin-Benutzer..."
$COMPOSE_CMD exec backend npm run create-admin

echo ""
echo "✅ Build abgeschlossen!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  PostgreSQL: localhost:5432"
echo ""
echo "🔑 Admin-Anmeldedaten:"
echo "   Benutzername: admin"
echo "   Passwort: admin123"
echo ""
echo "ℹ️  Logs anzeigen: $COMPOSE_CMD logs -f"
echo "🛑 Container stoppen: $COMPOSE_CMD down"
echo "" 