const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function createAdminUser() {
  try {
    console.log('🔐 Erstelle Admin-Benutzer...');
    
    // Passwort hashen (admin123)
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Prüfen ob Admin bereits existiert
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    if (existingUser.rows.length > 0) {
      // Admin existiert bereits - Passwort aktualisieren
      await pool.query(
        'UPDATE users SET password_hash = $1, email = $2, role = $3, is_active = $4 WHERE username = $5',
        [passwordHash, 'admin@example.com', 'admin', true, 'admin']
      );
      console.log('✅ Admin-Benutzer Passwort aktualisiert');
    } else {
      // Neuen Admin erstellen
      await pool.query(
        'INSERT INTO users (username, password_hash, email, role, is_active) VALUES ($1, $2, $3, $4, $5)',
        ['admin', passwordHash, 'admin@example.com', 'admin', true]
      );
      console.log('✅ Admin-Benutzer erstellt');
    }
    
    console.log('📋 Anmeldedaten:');
    console.log('   Benutzername: admin');
    console.log('   Passwort: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Admin-Benutzers:', error);
    process.exit(1);
  }
}

createAdminUser(); 