const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../config/database');
const router = express.Router();

// SMTP-Konfiguration abrufen
router.get('/config', async (req, res) => {
  let client;
  try {
    console.log('📧 SMTP Config - GET Request erhalten');
    
    // Datenbankverbindung mit Fehlerbehandlung
    client = await pool.connect();
    console.log('📧 SMTP Config - Datenbankverbindung hergestellt');
    
    // Prüfen ob Tabelle existiert
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'smtp_config'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ SMTP Config - Tabelle smtp_config existiert nicht');
      return res.status(404).json({ message: 'SMTP-Konfigurationstabelle nicht gefunden' });
    }
    
    const result = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('📧 SMTP Config - Keine Konfiguration gefunden');
      return res.status(404).json({ message: 'Keine SMTP-Konfiguration gefunden' });
    }

    const config = result.rows[0];
    console.log('📧 SMTP Config - Konfiguration gefunden:', { 
      id: config.id, 
      host: config.host, 
      port: config.port, 
      user: config.user 
    });
    
    // Passwort nicht zurückgeben (aus Sicherheitsgründen)
    const { password, ...safeConfig } = config;
    
    res.json(safeConfig);
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der SMTP-Konfiguration:', error);
    console.error('❌ Error Stack:', error.stack);
    res.status(500).json({ 
      error: 'Serverfehler beim Abrufen der SMTP-Konfiguration', 
      details: error.message,
      code: error.code 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// SMTP-Konfiguration speichern
router.post('/config', async (req, res) => {
  let client;
  try {
    console.log('📧 SMTP Config - POST Request erhalten:', { 
      ...req.body, 
      password: req.body.password ? '***' : 'undefined' 
    });
    
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    // Erweiterte Validierung
    if (!host || !port || !user || !password || !from_name || !from_email) {
      console.log('❌ SMTP Config - Validierungsfehler: Fehlende Felder');
      return res.status(400).json({ 
        error: 'Alle Felder sind erforderlich',
        missing_fields: {
          host: !host,
          port: !port,
          user: !user,
          password: !password,
          from_name: !from_name,
          from_email: !from_email
        }
      });
    }

    // Port validierung
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.log('❌ SMTP Config - Ungültiger Port:', port);
      return res.status(400).json({ error: 'Port muss eine Zahl zwischen 1 und 65535 sein' });
    }

    // E-Mail validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      console.log('❌ SMTP Config - Ungültige E-Mail:', from_email);
      return res.status(400).json({ error: 'Ungültige Absender-E-Mail-Adresse' });
    }

    // Datenbankverbindung mit Fehlerbehandlung
    client = await pool.connect();
    console.log('📧 SMTP Config - Datenbankverbindung für Speichern hergestellt');

    // Prüfen ob Tabelle existiert und ggf. erstellen
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'smtp_config'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('🔧 SMTP Config - Erstelle smtp_config Tabelle...');
      await client.query(`
        CREATE TABLE smtp_config (
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
      console.log('✅ SMTP Config - Tabelle erstellt');
      
      // Trigger für updated_at hinzufügen
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
      console.log('✅ SMTP Config - Trigger erstellt');
    }

    // Passwort NICHT verschlüsseln für E-Mail-Versand (speichere es temporär sicher)
    // In einer produktiven Umgebung sollte eine sicherere Lösung verwendet werden
    console.log('📧 SMTP Config - Passwort wird für E-Mail-Versand gespeichert');

    // Prüfen ob bereits eine Konfiguration existiert
    const existingConfig = await client.query('SELECT id FROM smtp_config ORDER BY created_at DESC LIMIT 1');

    let result;
    if (existingConfig.rows.length > 0) {
      console.log('📧 SMTP Config - Update existierende Konfiguration mit ID:', existingConfig.rows[0].id);
      // Update existierende Konfiguration - Store password for email sending
      result = await client.query(
        `UPDATE smtp_config 
         SET host = $1, port = $2, secure = $3, "user" = $4, password = $5, 
             from_name = $6, from_email = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING id, host, port, secure, "user", from_name, from_email, created_at, updated_at`,
        [host, portNum, secure === true, user, password, from_name, from_email, existingConfig.rows[0].id]
      );
    } else {
      console.log('📧 SMTP Config - Neue Konfiguration erstellen');
      // Neue Konfiguration erstellen - Store password for email sending
      result = await client.query(
        `INSERT INTO smtp_config (host, port, secure, "user", password, from_name, from_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, host, port, secure, "user", from_name, from_email, created_at, updated_at`,
        [host, portNum, secure === true, user, password, from_name, from_email]
      );
    }

    if (result.rows.length === 0) {
      console.error('❌ SMTP Config - Keine Zeilen zurückgegeben von der Datenbank');
      return res.status(500).json({ error: 'Datenbank-Operation fehlgeschlagen' });
    }

    const savedConfig = result.rows[0];
    console.log('✅ SMTP Config - Erfolgreich gespeichert mit ID:', savedConfig.id);
    
    res.json(savedConfig);
  } catch (error) {
    console.error('❌ Fehler beim Speichern der SMTP-Konfiguration:', error);
    console.error('❌ Error Stack:', error.stack);
    console.error('❌ Error Code:', error.code);
    console.error('❌ Error Detail:', error.detail);
    res.status(500).json({ 
      error: 'Serverfehler beim Speichern der SMTP-Konfiguration', 
      details: error.message,
      code: error.code,
      sqlState: error.code,
      position: error.position
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// SMTP-Verbindung testen
router.post('/test', async (req, res) => {
  try {
    console.log('📧 SMTP Test - Request erhalten:', { ...req.body, password: '***' });
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    if (!host || !port || !user || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alle SMTP-Felder sind für den Test erforderlich' 
      });
    }

    // Transporter erstellen
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure === true,
      auth: {
        user,
        pass: password
      },
      debug: true,
      logger: true
    });

    console.log('📧 SMTP Test - Transporter erstellt, teste Verbindung...');
    
    // Verbindung testen
    await transporter.verify();

    console.log('✅ SMTP Test - Verbindung erfolgreich');
    res.json({ 
      success: true, 
      message: 'SMTP-Verbindung erfolgreich getestet!' 
    });
  } catch (error) {
    console.error('❌ SMTP-Verbindungstest fehlgeschlagen:', error);
    res.json({ 
      success: false, 
      message: `Verbindungstest fehlgeschlagen: ${error.message}` 
    });
  }
});

// Test-E-Mail senden
router.post('/send-test-email', async (req, res) => {
  try {
    console.log('📧 Test-E-Mail - Request erhalten');
    const { host, port, secure, user, password, from_name, from_email, test_email } = req.body;

    if (!test_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test-E-Mail-Adresse ist erforderlich' 
      });
    }

    // Transporter erstellen
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure === true,
      auth: {
        user,
        pass: password
      }
    });

    // Test-E-Mail senden
    const mailOptions = {
      from: `"${from_name}" <${from_email}>`,
      to: test_email,
      subject: 'Test-E-Mail von QR Scanner Party App',
      html: `
        <h2>SMTP-Test erfolgreich!</h2>
        <p>Diese E-Mail wurde erfolgreich über Ihre SMTP-Konfiguration versendet.</p>
        <p><strong>Server:</strong> ${host}:${port}</p>
        <p><strong>Sichere Verbindung:</strong> ${secure ? 'Ja' : 'Nein'}</p>
        <p><strong>Von:</strong> ${from_name} &lt;${from_email}&gt;</p>
      `,
      text: `SMTP-Test erfolgreich! Diese E-Mail wurde über ${host}:${port} versendet.`
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ Test-E-Mail erfolgreich versendet');
    res.json({ 
      success: true, 
      message: 'Test-E-Mail erfolgreich versendet!' 
    });
  } catch (error) {
    console.error('❌ Fehler beim Senden der Test-E-Mail:', error);
    res.json({ 
      success: false, 
      message: `Test-E-Mail-Versand fehlgeschlagen: ${error.message}` 
    });
  }
});

// Einladungs-E-Mail senden
router.post('/send-invitation', async (req, res) => {
  let client;
  try {
    console.log('📧 Einladungs-E-Mail - Request erhalten');
    const { guestId, recipientEmail } = req.body;

    if (!guestId || !recipientEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gast-ID und E-Mail-Adresse sind erforderlich' 
      });
    }

    // Datenbankverbindung herstellen
    client = await pool.connect();
    
    // SMTP-Konfiguration aus der Datenbank laden
    const configResult = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine SMTP-Konfiguration gefunden. Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen.' 
      });
    }

    const config = configResult.rows[0];
    
    // Gast-Daten aus der Datenbank laden
    const guestResult = await client.query('SELECT * FROM guests WHERE id = $1', [guestId]);
    
    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gast nicht gefunden' 
      });
    }

    const guest = guestResult.rows[0];
    
    // SMTP-Transporter erstellen
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password // Passwort direkt verwenden
      }
    });

    // E-Mail-Inhalt erstellen
    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: recipientEmail,
      subject: 'Einladung zur Party - QR Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Du bist eingeladen! 🎉</h2>
          
          <p style="font-size: 16px; color: #555;">
            Hallo <strong>${guest.name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #555;">
            du bist herzlich zu unserer Party eingeladen! Verwende den QR-Code unten für den Check-in vor Ort.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <h3 style="color: #333; margin-bottom: 15px;">Dein persönlicher QR-Code:</h3>
            <img src="${guest.qr_code}" alt="QR Code für ${guest.name}" style="max-width: 200px; height: auto;" />
            <p style="margin-top: 10px; font-size: 14px; color: #777;">
              Zeige diesen QR-Code beim Check-in vor
            </p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Wichtige Informationen:</h4>
            <ul style="color: #555; margin: 10px 0; padding-left: 20px;">
              <li>Bringe diesen QR-Code auf deinem Handy mit</li>
              <li>Der QR-Code ist dein persönlicher Einlass</li>
              <li>Bei Fragen wende dich an das Event-Team</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
            Wir freuen uns auf dich! 🎊
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
          </p>
        </div>
      `,
      text: `
Hallo ${guest.name},

du bist herzlich zu unserer Party eingeladen!

Verwende den QR-Code in dieser E-Mail für den Check-in vor Ort.

Wichtige Informationen:
- Bringe diesen QR-Code auf deinem Handy mit
- Der QR-Code ist dein persönlicher Einlass
- Bei Fragen wende dich an das Event-Team

Wir freuen uns auf dich!

---
Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
      `
    };

    // E-Mail senden
    await transporter.sendMail(mailOptions);

    console.log('✅ Einladungs-E-Mail erfolgreich versendet an:', recipientEmail);
    
    res.json({ 
      success: true, 
      message: 'Einladungs-E-Mail erfolgreich versendet!' 
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Einladungs-E-Mail:', error);
    res.json({ 
      success: false, 
      message: `Einladungs-E-Mail-Versand fehlgeschlagen: ${error.message}` 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Geschäfts-Einladungs-E-Mail senden
router.post('/send-business-invite', async (req, res) => {
  let client;
  try {
    console.log('📧 Geschäfts-Einladungs-E-Mail - Request erhalten');
    const { businessEmail } = req.body;

    if (!businessEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geschäfts-E-Mail-Adresse ist erforderlich' 
      });
    }

    // Datenbankverbindung herstellen
    client = await pool.connect();
    
    // SMTP-Konfiguration aus der Datenbank laden
    const configResult = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine SMTP-Konfiguration gefunden. Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen.' 
      });
    }

    const config = configResult.rows[0];
    
    // SMTP-Transporter erstellen
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });

    // E-Mail-Inhalt erstellen
    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: businessEmail,
      subject: 'Einladung zur Party-Registrierung',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Sie sind eingeladen! 🎉</h2>
          
          <p style="font-size: 16px; color: #555;">
            Hallo,
          </p>
          
          <p style="font-size: 16px; color: #555;">
            Sie sind herzlich zu unserer Party eingeladen! Bitte registrieren Sie sich über den unten stehenden Link.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <h3 style="color: #333; margin-bottom: 15px;">Zur Registrierung:</h3>
            <a href="https://check-in.home-ki.eu/formular" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Jetzt registrieren
            </a>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Wichtige Informationen:</h4>
            <ul style="color: #555; margin: 10px 0; padding-left: 20px;">
              <li>Verwenden Sie diese Geschäfts-E-Mail-Adresse für die Registrierung</li>
              <li>Nach der Registrierung erhalten Sie Ihren persönlichen QR-Code</li>
              <li>Bei Fragen wende Sie sich an das Event-Team</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
            Wir freuen uns auf Sie! 🎊
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
          </p>
        </div>
      `,
      text: `
Hallo,

Sie sind herzlich zu unserer Party eingeladen!

Bitte registrieren Sie sich über diesen Link: https://check-in.home-ki.eu/formular

Wichtige Informationen:
- Verwenden Sie diese Geschäfts-E-Mail-Adresse für die Registrierung
- Nach der Registrierung erhalten Sie Ihren persönlichen QR-Code
- Bei Fragen wende Sie sich an das Event-Team

Wir freuen uns auf Sie!

---
Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
      `
    };

    // E-Mail senden
    await transporter.sendMail(mailOptions);

    console.log('✅ Geschäfts-Einladungs-E-Mail erfolgreich versendet an:', businessEmail);
    
    res.json({ 
      success: true, 
      message: 'Geschäfts-Einladungs-E-Mail erfolgreich versendet!' 
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Geschäfts-Einladungs-E-Mail:', error);
    res.json({ 
      success: false, 
      message: `Geschäfts-E-Mail-Versand fehlgeschlagen: ${error.message}` 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// QR-Code-E-Mail senden
router.post('/send-qr-code', async (req, res) => {
  let client;
  try {
    console.log('📧 QR-Code-E-Mail - Request erhalten');
    const { guestId, recipientEmail } = req.body;

    if (!guestId || !recipientEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gast-ID und E-Mail-Adresse sind erforderlich' 
      });
    }

    // Datenbankverbindung herstellen
    client = await pool.connect();
    
    // SMTP-Konfiguration aus der Datenbank laden
    const configResult = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine SMTP-Konfiguration gefunden. Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen.' 
      });
    }

    const config = configResult.rows[0];
    
    // Gast-Daten aus der Datenbank laden
    const guestResult = await client.query('SELECT * FROM guests WHERE id = $1', [guestId]);
    
    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gast nicht gefunden' 
      });
    }

    const guest = guestResult.rows[0];
    
    // SMTP-Transporter erstellen
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });

    // E-Mail-Inhalt erstellen
    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: recipientEmail,
      subject: `QR Code für ${guest.name} - Party Check-in`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">QR Code für die Party 🎉</h2>
          
          <p style="font-size: 16px; color: #555;">
            Hallo,
          </p>
          
          <p style="font-size: 16px; color: #555;">
            hier ist der QR-Code für <strong>${guest.name}</strong> für den Check-in bei unserer Party.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <h3 style="color: #333; margin-bottom: 15px;">QR-Code für ${guest.name}:</h3>
            <img src="${guest.qr_code}" alt="QR Code für ${guest.name}" style="max-width: 200px; height: auto;" />
            <p style="margin-top: 10px; font-size: 14px; color: #777;">
              Zeige diesen QR-Code beim Check-in vor
            </p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Wichtige Informationen:</h4>
            <ul style="color: #555; margin: 10px 0; padding-left: 20px;">
              <li>Bringe diesen QR-Code auf dem Handy mit</li>
              <li>Der QR-Code ist der persönliche Einlass für ${guest.name}</li>
              <li>Bei Fragen wende dich an das Event-Team</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
            Wir freuen uns auf euch! 🎊
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
          </p>
        </div>
      `,
      text: `
Hallo,

hier ist der QR-Code für ${guest.name} für den Check-in bei unserer Party.

Wichtige Informationen:
- Bringe diesen QR-Code auf dem Handy mit
- Der QR-Code ist der persönliche Einlass für ${guest.name}
- Bei Fragen wende dich an das Event-Team

Wir freuen uns auf euch!

---
Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
      `
    };

    // E-Mail senden
    await transporter.sendMail(mailOptions);

    console.log('✅ QR-Code-E-Mail erfolgreich versendet an:', recipientEmail);
    
    res.json({ 
      success: true, 
      message: 'QR-Code-E-Mail erfolgreich versendet!' 
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der QR-Code-E-Mail:', error);
    res.json({ 
      success: false, 
      message: `QR-Code-E-Mail-Versand fehlgeschlagen: ${error.message}` 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
