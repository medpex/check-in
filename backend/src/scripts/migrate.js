const pool = require('../config/database');

async function runMigrations() {
  let client;
  try {
    console.log('🔄 Führe Datenbankmigrationen aus...');

    client = await pool.connect();
    console.log('✅ Datenbankverbindung hergestellt');

    // Guests Tabelle
    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        qr_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        main_guest_id UUID,
        guest_type VARCHAR(50),
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP
      )
    `);
    console.log('✅ Guests Tabelle erstellt/überprüft');

    // Neue Spalten für bestehende Tabelle hinzufügen falls nicht vorhanden
    const columnsToAdd = [
      { name: 'email_sent', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'email_sent_at', type: 'TIMESTAMP' }
    ];

    for (const column of columnsToAdd) {
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='guests' AND column_name='${column.name}'
        );
      `);
      
      if (!columnExists.rows[0].exists) {
        await client.query(`ALTER TABLE guests ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Spalte ${column.name} hinzugefügt`);
      }
    }

    // Foreign Key für main_guest_id hinzufügen falls nicht vorhanden
    const constraintExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='guests_main_guest_id_fkey'
      );
    `);
    
    if (!constraintExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE guests ADD CONSTRAINT guests_main_guest_id_fkey 
        FOREIGN KEY (main_guest_id) REFERENCES guests(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign Key Constraint hinzugefügt');
    }

    // Checkins Tabelle
    await client.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        guest_id UUID NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checked_out_at TIMESTAMP,
        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Checkins Tabelle erstellt/überprüft');

    // Business Emails Tabelle
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Business Emails Tabelle erstellt/überprüft');

    // SMTP Config Tabelle - Fixed: "user" in Anführungszeichen
    await client.query(`
      CREATE TABLE IF NOT EXISTS smtp_config (
        id SERIAL PRIMARY KEY,
        host VARCHAR(500) NOT NULL,
        port INTEGER NOT NULL,
        secure BOOLEAN NOT NULL DEFAULT false,
        "user" VARCHAR(500) NOT NULL,
        password TEXT NOT NULL,
        from_name VARCHAR(500) NOT NULL,
        from_email VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ SMTP Config Tabelle erstellt/überprüft');

    // Trigger für SMTP Config updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_smtp_config_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const triggerExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_smtp_config_updated_at_trigger'
      );
    `);

    if (!triggerExists.rows[0].exists) {
      await client.query(`
        CREATE TRIGGER update_smtp_config_updated_at_trigger
            BEFORE UPDATE ON smtp_config
            FOR EACH ROW
            EXECUTE FUNCTION update_smtp_config_updated_at();
      `);
      console.log('✅ SMTP Config Trigger erstellt');
    }

    // Indizes für bessere Performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email)',
      'CREATE INDEX IF NOT EXISTS idx_guests_main_guest_id ON guests(main_guest_id)',
      'CREATE INDEX IF NOT EXISTS idx_guests_guest_type ON guests(guest_type)',
      'CREATE INDEX IF NOT EXISTS idx_guests_email_sent ON guests(email_sent)',
      'CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON checkins(checked_in_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON checkins(guest_id)',
      'CREATE INDEX IF NOT EXISTS idx_business_emails_email ON business_emails(email)',
      'CREATE INDEX IF NOT EXISTS idx_smtp_config_created_at ON smtp_config(created_at)'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Indizes erstellt/überprüft');

    console.log('🎉 Alle Migrationen erfolgreich abgeschlossen');
    
  } catch (error) {
    console.error('❌ Fehler bei Migrationen:', error);
    console.error('❌ Error Details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
