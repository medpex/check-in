
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
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert. Bitte Docker Compose installieren und erneut versuchen."
    exit 1
fi

echo "✅ Docker und Docker Compose sind installiert"

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei..."
    cp .env.example .env
fi

if [ ! -f backend/.env ]; then
    echo "📝 Erstelle backend/.env Datei..."
    cp backend/.env.example backend/.env
fi

echo "🐳 Starte Docker Services..."

# Stop any existing containers
docker-compose down

# Build and start services
docker-compose up -d --build

echo "⏳ Warte auf Datenbankstart..."
sleep 10

# Run database migrations
echo "📊 Führe Datenbankmigrationen aus..."
docker-compose exec backend npm run migrate

echo "🌱 Erstelle Testdaten..."
docker-compose exec backend npm run seed

echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  PostgreSQL: localhost:5432"
echo ""
echo "Logs anzeigen: docker-compose logs -f"
echo "Services stoppen: docker-compose down"
echo ""
