
const pool = require('../config/database');

async function runMigrations() {
  try {
    console.log('🔄 Führe Datenbankmigrationen aus...');

    // Guests Tabelle
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        qr_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Checkins Tabelle
    await pool.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id UUID PRIMARY KEY,
        guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        UNIQUE(guest_id)
      )
    `);

    // Indizes für bessere Performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON checkins(timestamp DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON checkins(guest_id)
    `);

    console.log('✅ Migrationen erfolgreich abgeschlossen');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler bei Migrationen:', error);
    process.exit(1);
  }
}

runMigrations();
