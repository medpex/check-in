#!/usr/bin/env node

/**
 * Test-Script für die Zeitbegrenzungslogik
 * 
 * Verwendung:
 * node scripts/test-time-limit.js [command]
 * 
 * Commands:
 * - status: Zeigt aktuellen Status
 * - reset: Setzt Installationszeit zurück (nur Development)
 * - configure <minutes>: Setzt Zeitbegrenzung
 * - simulate-expired: Simuliert abgelaufene Zeit (für Tests)
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN || 'test_token';

async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    if (endpoint.includes('/reset') || endpoint.includes('/configure')) {
      config.headers['X-Developer-Token'] = DEVELOPER_TOKEN;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      return error.response.data;
    } else {
      console.error('Network Error:', error.message);
      return { error: error.message };
    }
  }
}

async function showStatus() {
  console.log('🔍 Prüfe Zeitbegrenzungsstatus...\n');
  
  const status = await makeRequest('/time-limit/status');
  
  if (status.status === 'success') {
    const data = status.data;
    console.log('📊 Zeitbegrenzungsstatus:');
    console.log(`   Status: ${data.isExpired ? '❌ ABGELAUFEN' : '✅ AKTIV'}`);
    console.log(`   Nachricht: ${data.message}`);
    console.log(`   Installationszeit: ${new Date(data.installedAt).toLocaleString('de-DE')}`);
    console.log(`   Verbleibende Zeit: ${data.timeRemainingMinutes} Minuten`);
    console.log(`   Zeitbegrenzung: ${data.timeLimitMinutes} Minuten`);
    console.log(`   Read-Only Modus: ${data.isReadOnly ? 'Ja' : 'Nein'}`);
    console.log(`   Aktuelle Zeit: ${new Date(data.currentTime).toLocaleString('de-DE')}`);
  } else {
    console.error('❌ Fehler beim Abrufen des Status:', status);
  }
}

async function resetTimeLimit() {
  console.log('🔄 Setze Installationszeit zurück...\n');
  
  const result = await makeRequest('/time-limit/reset', 'POST');
  
  if (result.status === 'success') {
    console.log('✅ Installationszeit erfolgreich zurückgesetzt');
    console.log(`   Zeitstempel: ${new Date(result.timestamp).toLocaleString('de-DE')}`);
  } else {
    console.error('❌ Fehler beim Zurücksetzen:', result);
  }
}

async function configureTimeLimit(minutes) {
  if (!minutes || isNaN(minutes)) {
    console.error('❌ Bitte geben Sie eine gültige Anzahl Minuten an');
    return;
  }

  console.log(`⚙️  Setze Zeitbegrenzung auf ${minutes} Minuten...\n`);
  
  const result = await makeRequest('/time-limit/configure', 'POST', {
    timeLimitMinutes: parseInt(minutes)
  });
  
  if (result.status === 'success') {
    console.log('✅ Zeitbegrenzung erfolgreich konfiguriert');
    console.log(`   Neue Zeitbegrenzung: ${result.timeLimitMinutes} Minuten`);
  } else {
    console.error('❌ Fehler bei der Konfiguration:', result);
  }
}

async function simulateExpired() {
  console.log('🧪 Simuliere abgelaufene Zeit...\n');
  
  // Setze Zeitbegrenzung auf 1 Minute
  await configureTimeLimit(1);
  
  console.log('⏳ Warte 65 Sekunden...');
  await new Promise(resolve => setTimeout(resolve, 65000));
  
  // Prüfe Status
  await showStatus();
}

async function testAPIEndpoints() {
  console.log('🧪 Teste API-Endpunkte...\n');
  
  // Test 1: Health Check
  console.log('1. Health Check:');
  const health = await makeRequest('/health');
  if (health.status === 'OK') {
    console.log('   ✅ Health Check erfolgreich');
    if (health.timeLimit) {
      console.log(`   ⏰ Zeitbegrenzung: ${health.timeLimit.message}`);
    }
  } else {
    console.log('   ❌ Health Check fehlgeschlagen');
  }
  
  // Test 2: Time Limit Status
  console.log('\n2. Time Limit Status:');
  const status = await makeRequest('/time-limit/status');
  if (status.status === 'success') {
    console.log('   ✅ Status erfolgreich abgerufen');
  } else {
    console.log('   ❌ Status fehlgeschlagen');
  }
  
  // Test 3: Display Page
  console.log('\n3. Display Page:');
  try {
    const display = await makeRequest('/time-limit/display');
    if (typeof display === 'string' && display.includes('Zeitbegrenzung')) {
      console.log('   ✅ Display Page erfolgreich');
    } else {
      console.log('   ❌ Display Page fehlgeschlagen');
    }
  } catch (error) {
    console.log('   ❌ Display Page fehlgeschlagen:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  console.log('🚀 Time Limit Test Script\n');

  switch (command) {
    case 'status':
      await showStatus();
      break;
      
    case 'reset':
      await resetTimeLimit();
      break;
      
    case 'configure':
      await configureTimeLimit(arg);
      break;
      
    case 'simulate-expired':
      await simulateExpired();
      break;
      
    case 'test':
      await testAPIEndpoints();
      break;
      
    default:
      console.log('Verwendung: node scripts/test-time-limit.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  status              - Zeigt aktuellen Status');
      console.log('  reset               - Setzt Installationszeit zurück');
      console.log('  configure <minutes> - Setzt Zeitbegrenzung');
      console.log('  simulate-expired    - Simuliert abgelaufene Zeit');
      console.log('  test                - Testet alle API-Endpunkte');
      console.log('');
      console.log('Umgebungsvariablen:');
      console.log('  API_BASE            - API Basis-URL (Standard: http://localhost:3001/api)');
      console.log('  DEVELOPER_TOKEN     - Entwickler-Token für Reset/Configure');
  }
}

// Fehlerbehandlung
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error); 