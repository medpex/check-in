const pool = require('../config/database');

async function updateSMTPAuthOptional() {
  let client;
  try {
    console.log('🔧 Aktualisiere SMTP-Tabelle für optionale Authentifizierung...');
    
    client = await pool.connect();
    console.log('✅ Datenbankverbindung hergestellt');
    
    // Prüfe ob smtp_config Tabelle existiert
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'smtp_config'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('📧 smtp_config Tabelle existiert nicht, erstelle sie...');
      await client.query(`
        CREATE TABLE smtp_config (
          id SERIAL PRIMARY KEY,
          host VARCHAR(500) NOT NULL,
          port INTEGER NOT NULL,
          secure BOOLEAN NOT NULL DEFAULT false,
          username VARCHAR(500),
          password TEXT,
          from_name VARCHAR(500) NOT NULL,
          from_email VARCHAR(500) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ smtp_config Tabelle erstellt mit optionaler Authentifizierung');
    } else {
      console.log('📧 smtp_config Tabelle existiert, prüfe Spalten...');
      
      // Prüfe ob username Spalte bereits optional ist
      const userColumnCheck = await client.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'smtp_config' AND column_name = 'username'
      `);
      
      if (userColumnCheck.rows.length > 0 && userColumnCheck.rows[0].is_nullable === 'NO') {
        console.log('🔧 Mache username Spalte optional...');
        await client.query('ALTER TABLE smtp_config ALTER COLUMN username DROP NOT NULL');
        console.log('✅ username Spalte ist jetzt optional');
      } else {
        console.log('✅ username Spalte ist bereits optional');
      }
      
      // Prüfe ob password Spalte bereits optional ist
      const passwordColumnCheck = await client.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'smtp_config' AND column_name = 'password'
      `);
      
      if (passwordColumnCheck.rows.length > 0 && passwordColumnCheck.rows[0].is_nullable === 'NO') {
        console.log('🔧 Mache "password" Spalte optional...');
        await client.query('ALTER TABLE smtp_config ALTER COLUMN password DROP NOT NULL');
        console.log('✅ "password" Spalte ist jetzt optional');
      } else {
        console.log('✅ "password" Spalte ist bereits optional');
      }
    }
    
    // Trigger für updated_at hinzufügen/aktualisieren
    console.log('🔧 Erstelle/aktualisiere Trigger für updated_at...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_smtp_config_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Trigger löschen falls er existiert
    await client.query('DROP TRIGGER IF EXISTS update_smtp_config_updated_at_trigger ON smtp_config');
    
    // Trigger neu erstellen
    await client.query(`
      CREATE TRIGGER update_smtp_config_updated_at_trigger
          BEFORE UPDATE ON smtp_config
          FOR EACH ROW
          EXECUTE FUNCTION update_smtp_config_updated_at();
    `);
    
    console.log('✅ Trigger für updated_at erstellt/aktualisiert');
    
    // Zeige aktuelle Konfigurationen
    const configs = await client.query('SELECT id, host, port, username, from_name, from_email, created_at FROM smtp_config ORDER BY created_at DESC');
    console.log(`📧 Gefundene SMTP-Konfigurationen: ${configs.rows.length}`);
    
    if (configs.rows.length > 0) {
      console.log('Letzte Konfiguration:', configs.rows[0]);
    }
    
    console.log('🎉 SMTP-Tabelle erfolgreich für optionale Authentifizierung aktualisiert!');
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der SMTP-Tabelle:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Script ausführen wenn direkt aufgerufen
if (require.main === module) {
  updateSMTPAuthOptional()
    .then(() => {
      console.log('✅ SMTP-Aktualisierung abgeschlossen');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ SMTP-Aktualisierung fehlgeschlagen:', error);
      process.exit(1);
    });
}

module.exports = { updateSMTPAuthOptional }; 