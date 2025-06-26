
const pool = require('../config/database');

async function checkDatabase() {
  let client;
  try {
    console.log('🔍 Überprüfe Datenbankverbindung...');
    
    client = await pool.connect();
    console.log('✅ Datenbankverbindung erfolgreich');
    
    // Prüfe welche Tabellen existieren
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Vorhandene Tabellen:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Prüfe speziell smtp_config Tabelle
    const smtpTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'smtp_config'
      );
    `);
    
    if (smtpTableExists.rows[0].exists) {
      console.log('✅ smtp_config Tabelle existiert');
      
      // Zeige Spalten der Tabelle
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'smtp_config'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 smtp_config Spalten:');
      columnsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Zeige vorhandene Einträge
      const dataResult = await client.query('SELECT COUNT(*) FROM smtp_config');
      console.log(`📊 Anzahl SMTP-Konfigurationen: ${dataResult.rows[0].count}`);
      
    } else {
      console.log('❌ smtp_config Tabelle existiert NICHT');
      console.log('🔧 Erstelle smtp_config Tabelle...');
      
      await client.query(`
        CREATE TABLE smtp_config (
          id SERIAL PRIMARY KEY,
          host VARCHAR(500) NOT NULL,
          port INTEGER NOT NULL,
          secure BOOLEAN NOT NULL DEFAULT false,
          user VARCHAR(500) NOT NULL,
          password TEXT NOT NULL,
          from_name VARCHAR(500) NOT NULL,
          from_email VARCHAR(500) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ smtp_config Tabelle erstellt');
      
      // Trigger für updated_at
      await client.query(`
        CREATE OR REPLACE FUNCTION update_smtp_config_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      
      await client.query(`
        CREATE TRIGGER update_smtp_config_updated_at_trigger
            BEFORE UPDATE ON smtp_config
            FOR EACH ROW
            EXECUTE FUNCTION update_smtp_config_updated_at();
      `);
      
      console.log('✅ Trigger erstellt');
    }
    
  } catch (error) {
    console.error('❌ Datenbankfehler:', error);
    console.error('❌ Error Details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}

checkDatabase()
  .then(() => {
    console.log('🎉 Datenbankprüfung abgeschlossen');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schwerwiegender Fehler:', error);
    process.exit(1);
  });
