
#!/bin/bash

# QR Scanner Party App - Reset Script

echo "🔄 QR Scanner Party App Reset"
echo "============================="

echo "⚠️  Dies wird alle Daten löschen! Fortfahren? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Abgebrochen"
    exit 1
fi

echo "🛑 Stoppe alle Services..."
docker-compose down -v

echo "🗑️  Entferne alte Images..."
docker-compose build --no-cache

echo "🐳 Starte Services neu..."
docker-compose up -d

echo "⏳ Warte auf Datenbankstart..."
sleep 15

echo "📊 Führe Datenbankmigrationen aus..."
docker-compose exec backend npm run migrate

echo "🌱 Erstelle Testdaten..."
docker-compose exec backend npm run seed

echo ""
echo "✅ Reset abgeschlossen!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3001"
echo ""
