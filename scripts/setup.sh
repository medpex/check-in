
#!/bin/bash

# QR Scanner Party App - Setup Script

echo "🎉 QR Scanner Party App Setup"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert. Bitte Docker installieren und erneut versuchen."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert. Bitte Docker Compose installieren und erneut versuchen."
    exit 1
fi

echo "✅ Docker und Docker Compose sind installiert"

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei..."
    echo "APP_BASE_URL=https://check-in.home-ki.eu" > .env
    echo "VITE_API_URL=http://localhost:3001/api" >> .env
    echo "TIME_LIMIT_MINUTES=5" >> .env
    echo "DEVELOPER_TOKEN=dev_token_123" >> .env
fi

if [ ! -f backend/.env ]; then
    echo "📝 Erstelle backend/.env Datei..."
    echo "NODE_ENV=development" > backend/.env
    echo "DATABASE_URL=postgresql://qr_scanner_user:secure_password_123@postgres:5432/qr_scanner_db" >> backend/.env
    echo "DB_HOST=postgres" >> backend/.env
    echo "DB_PORT=5432" >> backend/.env
    echo "DB_NAME=qr_scanner_db" >> backend/.env
    echo "DB_USER=qr_scanner_user" >> backend/.env
    echo "DB_PASSWORD=secure_password_123" >> backend/.env
    echo "PORT=3001" >> backend/.env
    echo "APP_BASE_URL=https://check-in.home-ki.eu" >> backend/.env
    echo "CORS_ORIGIN=http://localhost:8080" >> backend/.env
    echo "TIME_LIMIT_MINUTES=5" >> backend/.env
    echo "DEVELOPER_TOKEN=dev_token_123" >> backend/.env
fi

echo "🐳 Starte Docker Services..."

# Stop any existing containers
if command -v docker-compose &> /dev/null; then
    docker-compose down
else
    docker compose down
fi

# Build and start services
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

echo "⏳ Warte auf Datenbankstart..."
sleep 15

# Run database migrations
echo "📊 Führe Datenbankmigrationen aus..."
if command -v docker-compose &> /dev/null; then
    docker-compose exec backend npm run migrate
else
    docker compose exec backend npm run migrate
fi

echo "🌱 Erstelle Testdaten..."
if command -v docker-compose &> /dev/null; then
    docker-compose exec backend npm run seed
else
    docker compose exec backend npm run seed
fi

echo "⏰ Prüfe Zeitlimit-Status..."
if command -v docker-compose &> /dev/null; then
    docker-compose exec backend curl -s http://localhost:3001/api/time-limit/status
else
    docker compose exec backend curl -s http://localhost:3001/api/time-limit/status
fi

echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  PostgreSQL: localhost:5432"
echo "🔐 Admin Login: admin / admin123"
echo "⏰ Zeitlimit: 5 Minuten (konfigurierbar)"
echo ""

if command -v docker-compose &> /dev/null; then
    echo "Logs anzeigen: docker-compose logs -f"
    echo "Services stoppen: docker-compose down"
    echo "Zeitlimit zurücksetzen: docker-compose exec backend curl -X POST http://localhost:3001/api/time-limit/reset -H 'Content-Type: application/json' -d '{\"token\":\"dev_token_123\"}'"
else
    echo "Logs anzeigen: docker compose logs -f"
    echo "Services stoppen: docker compose down"
    echo "Zeitlimit zurücksetzen: docker compose exec backend curl -X POST http://localhost:3001/api/time-limit/reset -H 'Content-Type: application/json' -d '{\"token\":\"dev_token_123\"}'"
fi
echo ""
echo "📋 Neue Features:"
echo "  • Zeitlimit-System (5 Minuten Standard)"
echo "  • Either/Or Gästetyp-Auswahl (Familie ODER Freunde)"
echo "  • E-Mail-Versand für zusätzliche Gäste"
echo "  • Globales Zeitlimit-Popup"
echo ""
