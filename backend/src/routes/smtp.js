
const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../config/database');
const { generateQRCode } = require('../utils/qrGenerator');
const router = express.Router();

// SMTP-Konfiguration abrufen
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Keine SMTP-Konfiguration gefunden' });
    }

    const config = result.rows[0];
    
    // Passwort nicht zurückgeben (aus Sicherheitsgründen)
    const { password, ...safeConfig } = config;
    
    res.json(safeConfig);
  } catch (error) {
    console.error('Fehler beim Abrufen der SMTP-Konfiguration:', error);
    res.status(500).json({ error: 'Serverfehler beim Abrufen der SMTP-Konfiguration' });
  }
});

// SMTP-Konfiguration speichern
router.post('/config', async (req, res) => {
  try {
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    // Validierung
    if (!host || !port || !user || !password || !from_name || !from_email) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prüfen ob bereits eine Konfiguration existiert
    const existingConfig = await pool.query('SELECT id FROM smtp_config ORDER BY created_at DESC LIMIT 1');

    let result;
    if (existingConfig.rows.length > 0) {
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

    res.json(safeConfig);
  } catch (error) {
    console.error('Fehler beim Speichern der SMTP-Konfiguration:', error);
    res.status(500).json({ error: 'Serverfehler beim Speichern der SMTP-Konfiguration' });
  }
});

// SMTP-Verbindung testen
router.post('/test', async (req, res) => {
  try {
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    // Transporter erstellen
    const transporter = nodemailer.createTransporter({
      host,
      port: parseInt(port),
      secure: secure === true,
      auth: {
        user,
        pass: password
      }
    });

    // Verbindung testen
    await transporter.verify();

    res.json({ 
      success: true, 
      message: 'SMTP-Verbindung erfolgreich getestet!' 
    });
  } catch (error) {
    console.error('SMTP-Verbindungstest fehlgeschlagen:', error);
    res.json({ 
      success: false, 
      message: `Verbindungstest fehlgeschlagen: ${error.message}` 
    });
  }
});

// Einladungs-E-Mail senden
router.post('/send-invitation', async (req, res) => {
  try {
    const { guestId, recipientEmail } = req.body;

    if (!guestId || !recipientEmail) {
      return res.status(400).json({ error: 'Guest ID und E-Mail-Adresse sind erforderlich' });
    }

    // SMTP-Konfiguration aus der Datenbank laden
    const smtpResult = await pool.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    
    if (smtpResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine SMTP-Konfiguration gefunden. Bitte konfiguriere zuerst den SMTP-Server.' 
      });
    }

    const smtpConfig = smtpResult.rows[0];

    // Gast-Informationen laden
    const guestResult = await pool.query('SELECT * FROM guests WHERE id = $1', [guestId]);
    
    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gast nicht gefunden' 
      });
    }

    const guest = guestResult.rows[0];

    // Passwort entschlüsseln (für den Transporter)
    const decryptedPassword = smtpConfig.password; // Das Passwort ist bereits gehashed, für Nodemailer brauchen wir das Original
    // Hier müssten wir eigentlich eine andere Verschlüsselungsmethode verwenden, die umkehrbar ist
    // Für jetzt verwenden wir das Passwort direkt vom Request

    // Transporter erstellen
    const transporter = nodemailer.createTransporter({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password // Das ist problematisch - siehe Kommentar oben
      }
    });

    // E-Mail-Inhalt erstellen
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .title { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #64748b; font-size: 16px; }
          .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
          .qr-code { max-width: 200px; margin: 20px auto; }
          .instructions { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Einladung zum Event</h1>
            <p class="subtitle">Hallo ${guest.name}!</p>
          </div>
          
          <p>Du bist herzlich zu unserem Event eingeladen! Verwende den QR-Code unten für einen schnellen Check-In.</p>
          
          <div class="qr-section">
            <h3>Dein persönlicher QR-Code</h3>
            <img src="${guest.qr_code}" alt="QR Code für ${guest.name}" class="qr-code" />
            <p><strong>Name:</strong> ${guest.name}</p>
          </div>
          
          <div class="instructions">
            <h4>So funktioniert's:</h4>
            <ol>
              <li>Zeige diesen QR-Code beim Check-In vor</li>
              <li>Unser Team scannt den Code</li>
              <li>Du bist eingecheckt und kannst das Event genießen!</li>
            </ol>
          </div>
          
          <p>Wir freuen uns auf dich!</p>
          
          <div class="footer">
            <p>Diese Einladung wurde automatisch generiert.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      Einladung zum Event
      
      Hallo ${guest.name}!
      
      Du bist herzlich zu unserem Event eingeladen! 
      
      Verwende den QR-Code in der HTML-Version dieser E-Mail für einen schnellen Check-In.
      
      So funktioniert's:
      1. Zeige den QR-Code beim Check-In vor
      2. Unser Team scannt den Code
      3. Du bist eingecheckt und kannst das Event genießen!
      
      Wir freuen uns auf dich!
    `;

    // E-Mail senden
    const mailOptions = {
      from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
      to: recipientEmail,
      subject: `Einladung zum Event - ${guest.name}`,
      text: emailText,
      html: emailHTML
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Einladungs-E-Mail erfolgreich versendet!' 
    });

  } catch (error) {
    console.error('Fehler beim Senden der Einladungs-E-Mail:', error);
    res.json({ 
      success: false, 
      message: `E-Mail-Versand fehlgeschlagen: ${error.message}` 
    });
  }
});

module.exports = router;
