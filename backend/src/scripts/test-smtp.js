
const pool = require('../config/database');

async function testSMTPSetup() {
  try {
    console.log('🔍 Teste Datenbankverbindung...');
    
    // Datenbankverbindung testen
    const client = await pool.connect();
    console.log('✅ Datenbankverbindung erfolgreich');
    
    // Prüfen ob smtp_config Tabelle existiert
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'smtp_config'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ smtp_config Tabelle existiert');
      
      // Zeige vorhandene Konfigurationen
      const configs = await client.query('SELECT id, host, port, user, from_name, from_email, created_at FROM smtp_config ORDER BY created_at DESC');
      console.log(`📧 Gefundene SMTP-Konfigurationen: ${configs.rows.length}`);
      
      if (configs.rows.length > 0) {
        console.log('Letzte Konfiguration:', configs.rows[0]);
      }
    } else {
      console.log('❌ smtp_config Tabelle existiert nicht');
      console.log('🔧 Erstelle smtp_config Tabelle...');
      
      await client.query(`
        CREATE TABLE smtp_config (
          id SERIAL PRIMARY KEY,
          host VARCHAR(255) NOT NULL,
          port INTEGER NOT NULL,
          secure BOOLEAN NOT NULL DEFAULT false,
          user VARCHAR(255) NOT NULL,
          password TEXT NOT NULL,
          from_name VARCHAR(255) NOT NULL,
          from_email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ smtp_config Tabelle erstellt');
    }
    
    client.release();
    console.log('🎉 SMTP-Setup Test abgeschlossen');
    
  } catch (error) {
    console.error('❌ Fehler beim SMTP-Setup Test:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testSMTPSetup();
