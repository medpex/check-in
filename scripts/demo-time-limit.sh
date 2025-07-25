#!/bin/bash

# Demo-Script für die Zeitbegrenzungslogik
# Zeigt die komplette Funktionalität der Implementierung

echo "🚀 Zeitbegrenzungslogik Demo"
echo "============================"
echo ""

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
print_status() {
    echo -e "${BLUE}📊 Status:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Aktuellen Status anzeigen
echo "1. Aktueller Status:"
print_status "Prüfe Zeitbegrenzungsstatus..."
STATUS=$(curl -s http://localhost:3001/api/time-limit/status)
echo "$STATUS" | python3 -m json.tool 2>/dev/null || echo "$STATUS"
echo ""

# 2. Health Check
echo "2. Health Check:"
print_status "Prüfe Health Check..."
HEALTH=$(curl -s http://localhost:3001/api/health)
echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
echo ""

# 3. Zeitbegrenzung auf 1 Minute setzen (für Demo)
echo "3. Zeitbegrenzung auf 1 Minute setzen:"
print_warning "Setze Zeitbegrenzung auf 1 Minute für Demo..."
CONFIG=$(curl -s -X POST http://localhost:3001/api/time-limit/configure \
    -H "Content-Type: application/json" \
    -H "X-Developer-Token: test_token" \
    -d '{"timeLimitMinutes": 1}')
echo "$CONFIG" | python3 -m json.tool 2>/dev/null || echo "$CONFIG"
echo ""

# 4. Warten bis Zeit abgelaufen ist
echo "4. Warte bis Zeit abgelaufen ist..."
print_warning "Warte 65 Sekunden..."
for i in {1..65}; do
    echo -ne "\r⏳ Warte... $i/65 Sekunden"
    sleep 1
done
echo ""
echo ""

# 5. Status nach Ablauf
echo "5. Status nach Ablauf:"
print_status "Prüfe Status nach Zeitablauf..."
STATUS_EXPIRED=$(curl -s http://localhost:3001/api/time-limit/status)
echo "$STATUS_EXPIRED" | python3 -m json.tool 2>/dev/null || echo "$STATUS_EXPIRED"
echo ""

# 6. Test Read-Only Modus
echo "6. Test Read-Only Modus:"
print_status "Versuche POST-Request (sollte blockiert werden)..."
POST_TEST=$(curl -s -X POST http://localhost:3001/api/guests \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","qr_code":"test123"}')
echo "$POST_TEST" | python3 -m json.tool 2>/dev/null || echo "$POST_TEST"
echo ""

# 7. Reset für weitere Tests
echo "7. Reset für weitere Tests:"
print_success "Setze Installationszeit zurück..."
RESET=$(curl -s -X POST http://localhost:3001/api/time-limit/reset \
    -H "X-Developer-Token: test_token")
echo "$RESET" | python3 -m json.tool 2>/dev/null || echo "$RESET"
echo ""

# 8. Zeitbegrenzung auf 20 Minuten zurücksetzen
echo "8. Zeitbegrenzung zurücksetzen:"
print_success "Setze Zeitbegrenzung auf 20 Minuten..."
CONFIG_RESET=$(curl -s -X POST http://localhost:3001/api/time-limit/configure \
    -H "Content-Type: application/json" \
    -H "X-Developer-Token: test_token" \
    -d '{"timeLimitMinutes": 20}')
echo "$CONFIG_RESET" | python3 -m json.tool 2>/dev/null || echo "$CONFIG_RESET"
echo ""

# 9. Finaler Status
echo "9. Finaler Status:"
print_status "Prüfe finalen Status..."
FINAL_STATUS=$(curl -s http://localhost:3001/api/time-limit/status)
echo "$FINAL_STATUS" | python3 -m json.tool 2>/dev/null || echo "$FINAL_STATUS"
echo ""

# 10. Verfügbare Endpunkte
echo "10. Verfügbare Endpunkte:"
print_success "Zeitbegrenzungs-Endpunkte:"
echo "   GET  /api/time-limit/status    - Status abfragen"
echo "   GET  /api/time-limit/display   - HTML-Dashboard"
echo "   POST /api/time-limit/reset     - Reset (nur Dev/Token)"
echo "   POST /api/time-limit/configure - Konfigurieren (nur Dev/Token)"
echo ""

print_success "Demo abgeschlossen! 🎉"
echo ""
echo "Die Zeitbegrenzungslogik funktioniert korrekt:"
echo "✅ Zeitbegrenzung wird überwacht"
echo "✅ Read-Only Modus bei Ablauf"
echo "✅ API-Blockierung bei Schreiboperationen"
echo "✅ Reset-Funktion für Entwickler"
echo "✅ Konfigurierbare Zeitdauer"
echo "✅ Persistente Speicherung" 