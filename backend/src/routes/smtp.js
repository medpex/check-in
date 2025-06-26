
const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../config/database');
const router = express.Router();

// SMTP-Konfiguration abrufen
router.get('/config', async (req, res) => {
  try {
    console.log('📧 SMTP Config - GET Request erhalten');
    const result = await pool.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('📧 SMTP Config - Keine Konfiguration gefunden');
      return res.status(404).json({ message: 'Keine SMTP-Konfiguration gefunden' });
    }

    const config = result.rows[0];
    console.log('📧 SMTP Config - Konfiguration gefunden:', { host: config.host, port: config.port, user: config.user });
    
    // Passwort nicht zurückgeben (aus Sicherheitsgründen)
    const { password, ...safeConfig } = config;
    
    res.json(safeConfig);
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der SMTP-Konfiguration:', error);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der SMTP-Konfiguration', details: error.message });
  }
});

// SMTP-Konfiguration speichern
router.post('/config', async (req, res) => {
  try {
    console.log('📧 SMTP Config - POST Request erhalten:', { ...req.body, password: '***' });
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    // Validierung
    if (!host || !port || !user || !password || !from_name || !from_email) {
      console.log('❌ SMTP Config - Validierungsfehler: Fehlende Felder');
      return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('📧 SMTP Config - Passwort verschlüsselt');

    // Prüfen ob bereits eine Konfiguration existiert
    const existingConfig = await pool.query('SELECT id FROM smtp_config ORDER BY created_at DESC LIMIT 1');

    let result;
    if (existingConfig.rows.length > 0) {
      console.log('📧 SMTP Config - Update existierende Konfiguration');
      // Update existierende Konfiguration
      result = await pool.query(
        `UPDATE smtp_config 
         SET host = $1, port = $2, secure = $3, user = $4, password = $5, 
             from_name = $6, from_email = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING *`,
        [host, port, secure, user, hashedPassword, from_name, from_email, existingConfig.rows[0].id]
      );
    } else {
      console.log('📧 SMTP Config - Neue Konfiguration erstellen');
      // Neue Konfiguration erstellen
      result = await pool.query(
        `INSERT INTO smtp_config (host, port, secure, user, password, from_name, from_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [host, port, secure, user, hashedPassword, from_name, from_email]
      );
    }

    const savedConfig = result.rows[0];
    const { password: _, ...safeConfig } = savedConfig;

    console.log('✅ SMTP Config - Erfolgreich gespeichert');
    res.json(safeConfig);
  } catch (error) {
    console.error('❌ Fehler beim Speichern der SMTP-Konfiguration:', error);
    res.status(500).json({ error: 'Serverfehler beim Speichern der SMTP-Konfiguration', details: error.message });
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

    // Transporter erstellen - KORRIGIERT: createTransport statt createTransporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure === true,
      auth: {
        user,
        pass: password
      },
      debug: true, // Debug-Modus aktivieren
      logger: true // Logging aktivieren
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

    // Transporter erstellen - KORRIGIERT: createTransport statt createTransporter
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
  try {
    console.log('📧 Einladungs-E-Mail - Request erhalten');
    const { guestId, recipientEmail } = req.body;

    if (!guestId || !recipientEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gast-ID und E-Mail-Adresse sind erforderlich' 
      });
    }

    // SMTP-Konfiguration aus der Datenbank laden
    const configResult = await pool.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine SMTP-Konfiguration gefunden. Bitte konfigurieren Sie zuerst die E-Mail-Einstellungen.' 
      });
    }

    const config = configResult.rows[0];
    
    // Passwort entschlüsseln ist nicht möglich, da es gehasht ist
    // Für Einladungen sollte die SMTP-Konfiguration anders gespeichert werden
    // Vorerst Fehlermeldung zurückgeben
    res.json({ 
      success: false, 
      message: 'Einladungs-E-Mail-Funktionalität wird noch implementiert. Die SMTP-Konfiguration muss für E-Mail-Versand angepasst werden.' 
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Senden der Einladungs-E-Mail:', error);
    res.json({ 
      success: false, 
      message: `Einladungs-E-Mail-Versand fehlgeschlagen: ${error.message}` 
    });
  }
});

module.exports = router;
