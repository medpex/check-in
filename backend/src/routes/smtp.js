
const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../config/database');
const { sendInvitationEmail } = require('../services/emailService'); // Import email service
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const emailTemplateService = require('../services/emailTemplateService');
const router = express.Router();

// Alle Routen erfordern Authentifizierung und Admin-Berechtigung
router.use(authenticateToken);
router.use(requireAdmin);

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
      user: config.usernamename 
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
    
    const { host, port, secure, username, password, from_name, from_email } = req.body;

    // Erweiterte Validierung - Benutzername und Passwort sind optional
    if (!host || !port || !from_name || !from_email) {
      console.log('❌ SMTP Config - Validierungsfehler: Fehlende Pflichtfelder');
      return res.status(400).json({ 
        error: 'Host, Port, Absender-Name und Absender-E-Mail sind erforderlich',
        missing_fields: {
          host: !host,
          port: !port,
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
          "user" VARCHAR(500),
          password TEXT,
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
      // Update existierende Konfiguration - Benutzername und Passwort können null sein
      result = await client.query(
        `UPDATE smtp_config 
         SET host = $1, port = $2, secure = $3, username = $4, password = $5, 
             from_name = $6, from_email = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING id, host, port, secure, username, from_name, from_email, created_at, updated_at`,
        [host, portNum, secure === true, username || null, password || null, from_name, from_email, existingConfig.rows[0].id]
      );
    } else {
      console.log('📧 SMTP Config - Neue Konfiguration erstellen');
      // Neue Konfiguration erstellen - Benutzername und Passwort können null sein
      result = await client.query(
        `INSERT INTO smtp_config (host, port, secure, username, password, from_name, from_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, host, port, secure, username, from_name, from_email, created_at, updated_at`,
        [host, portNum, secure === true, username || null, password || null, from_name, from_email]
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
    const { host, port, secure, username, password, from_name, from_email } = req.body;

    if (!host || !port) {
      return res.status(400).json({ 
        success: false, 
        message: 'Host und Port sind für den Test erforderlich' 
      });
    }

    // Transporter erstellen - mit oder ohne Authentifizierung
    const transporterConfig = {
      host,
      port: parseInt(port),
      secure: secure === true,
      debug: true,
      logger: true
    };

    // Authentifizierung nur hinzufügen wenn Benutzername und Passwort vorhanden sind
    if (username && password) {
      transporterConfig.auth = {
        user: username,
        pass: password
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

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
    const { host, port, secure, username, password, from_name, from_email, test_email } = req.body;

    if (!test_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test-E-Mail-Adresse ist erforderlich' 
      });
    }

    // Transporter erstellen - mit oder ohne Authentifizierung
    const transporterConfig = {
      host,
      port: parseInt(port),
      secure: secure === true
    };

    // Authentifizierung nur hinzufügen wenn Benutzername und Passwort vorhanden sind
    if (username && password) {
      transporterConfig.auth = {
        user: username,
        pass: password
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

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

    client = await pool.connect();
    
    const configResult = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine SMTP-Konfiguration gefunden. Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen.' 
      });
    }
    const smtpConfig = configResult.rows[0];
    
    const guestResult = await client.query('SELECT * FROM guests WHERE id = $1', [guestId]);
    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gast nicht gefunden' 
      });
    }
    const guest = guestResult.rows[0];
    
    // Verwende den zentralisierten E-Mail-Service
    await sendInvitationEmail(guest, smtpConfig);
    
    // Update email_sent status
    await client.query(
      'UPDATE guests SET email_sent = TRUE, email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
      [guest.id]
    );
    
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
    
    // SMTP-Transporter erstellen - mit oder ohne Authentifizierung
    const transporterConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure
    };

    // Authentifizierung nur hinzufügen wenn Benutzername und Passwort vorhanden sind
    if (config.username && config.password) {
      transporterConfig.auth = {
        user: config.username,
        pass: config.password
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // E-Mail-Inhalt mit Template erstellen
    const emailTemplate = await emailTemplateService.generateBusinessInvitationEmail(businessEmail);
    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: businessEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
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
    
    // SMTP-Transporter erstellen - mit oder ohne Authentifizierung
    const transporterConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure
    };

    // Authentifizierung nur hinzufügen wenn Benutzername und Passwort vorhanden sind
    if (config.username && config.password) {
      transporterConfig.auth = {
        user: config.username,
        pass: config.password
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // E-Mail-Inhalt mit Template erstellen
    const emailTemplate = await emailTemplateService.generateQRCodeEmail(guest, recipientEmail);
    const mailOptions = {
      from: `"${config.from_name}" <${config.from_email}>`,
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
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
