#!/bin/bash

# QR Scanner Party App - Start Script

echo "🚀 Starte alle Container (alte Instanzen werden zuerst gestoppt)"
echo "==============================================================="

# Prüfe, ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert. Bitte Docker installieren und erneut versuchen."
    exit 1
fi

# Prüfe, ob Docker Compose installiert ist
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose ist nicht installiert. Bitte Docker Compose installieren und erneut versuchen."
    exit 1
fi

echo "🛑 Stoppe alte Container..."
$COMPOSE_CMD down

echo "🐳 Starte Container..."
$COMPOSE_CMD up -d

if [ $? -eq 0 ]; then
    echo "✅ Alle Container wurden erfolgreich gestartet!"
    echo "📱 Frontend: http://localhost:8080"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🗄️  PostgreSQL: localhost:5432"
else
    echo "❌ Fehler beim Starten der Container. Bitte Logs prüfen."
fi

echo ""
echo "ℹ️  Logs anzeigen: $COMPOSE_CMD logs -f"
echo "🛑 Container stoppen: $COMPOSE_CMD down"
echo "" 