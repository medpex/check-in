const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Formular-Einstellungen Routen (ohne Authentifizierung - für öffentliche Formulare)
router.get('/form', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM form_settings ORDER BY created_at DESC LIMIT 1');
    res.json(result.rows[0] || { background_color: '#3B82F6', logo_url: null });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der Formular-Einstellungen.' });
  }
});

// Formular-Einstellungen speichern (erfordert Admin-Berechtigung)
router.post('/form', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { background_color, logo_url } = req.body;
    if (!background_color) return res.status(400).json({ error: 'Hintergrundfarbe ist erforderlich.' });

    const existing = await pool.query('SELECT id FROM form_settings LIMIT 1');
    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE form_settings SET background_color = $1, logo_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [background_color, logo_url, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO form_settings (background_color, logo_url) VALUES ($1, $2)`,
        [background_color, logo_url]
      );
    }
    res.json({ message: 'Formular-Einstellungen gespeichert.' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Speichern der Formular-Einstellungen.' });
  }
});

// Logo-Upload (erfordert Admin-Berechtigung)
router.post('/form/logo', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { logo_url } = req.body;

    if (!logo_url) {
      return res.status(400).json({ error: 'Logo-URL ist erforderlich.' });
    }

    // URL validieren
    try {
      new URL(logo_url);
    } catch {
      return res.status(400).json({ error: 'Ungültige URL.' });
    }

    // Prüfen ob bereits Einstellungen existieren
    const existingResult = await pool.query('SELECT id FROM form_settings LIMIT 1');
    
    if (existingResult.rows.length > 0) {
      // Update bestehende Einstellungen
      await pool.query(
        `UPDATE form_settings SET 
         logo_url = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [logo_url, existingResult.rows[0].id]
      );
    } else {
      // Neue Einstellungen erstellen
      await pool.query(
        `INSERT INTO form_settings (logo_url) VALUES ($1)`,
        [logo_url]
      );
    }

    res.json({ message: 'Logo erfolgreich gespeichert.' });
  } catch (error) {
    console.error('Error saving logo:', error);
    res.status(500).json({ error: 'Fehler beim Speichern des Logos.' });
  }
});

// Admin-Routen erfordern Authentifizierung und Admin-Berechtigung
router.use(authenticateToken);
router.use(requireAdmin);

// SMTP Konfiguration abrufen
router.get('/smtp', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der SMTP-Konfiguration.' });
  }
});

// SMTP Konfiguration speichern
router.post('/smtp', async (req, res) => {
  try {
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    // Validierung
    if (!host || !port || !user || !password || !from_name || !from_email) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
    }

    // Prüfen ob bereits eine Konfiguration existiert
    const existingResult = await pool.query('SELECT id FROM smtp_config LIMIT 1');
    
    if (existingResult.rows.length > 0) {
      // Update bestehende Konfiguration
      await pool.query(
        `UPDATE smtp_config SET 
         host = $1, port = $2, secure = $3, username = $4, password = $5, 
         from_name = $6, from_email = $7, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $8`,
        [host, port, secure, user, password, from_name, from_email, existingResult.rows[0].id]
      );
    } else {
      // Neue Konfiguration erstellen
      await pool.query(
        `INSERT INTO smtp_config 
         (host, port, secure, username, password, from_name, from_email) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [host, port, secure, user, password, from_name, from_email]
      );
    }

    res.json({ message: 'SMTP-Konfiguration erfolgreich gespeichert.' });
  } catch (error) {
    console.error('Error saving SMTP config:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der SMTP-Konfiguration.' });
  }
});

// SMTP Konfiguration testen
router.post('/smtp/test', async (req, res) => {
  try {
    const { host, port, secure, user, password, from_name, from_email } = req.body;

    // Validierung
    if (!host || !port || !user || !password || !from_name || !from_email) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich.' });
    }

    const nodemailer = require('nodemailer');

    // Transporter erstellen
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: password
      }
    });

    // Test-E-Mail senden
    const testEmail = {
      from: `"${from_name}" <${from_email}>`,
      to: from_email, // An sich selbst senden
      subject: 'SMTP Test - QR Scanner Party App',
      text: 'Dies ist eine Test-E-Mail zur Überprüfung der SMTP-Konfiguration.',
      html: `
        <h2>SMTP Test erfolgreich!</h2>
        <p>Die SMTP-Konfiguration funktioniert korrekt.</p>
        <p><strong>Host:</strong> ${host}</p>
        <p><strong>Port:</strong> ${port}</p>
        <p><strong>Secure:</strong> ${secure ? 'Ja' : 'Nein'}</p>
        <p><strong>Benutzer:</strong> ${user}</p>
        <p><strong>Absender:</strong> ${from_name} &lt;${from_email}&gt;</p>
      `
    };

    await transporter.verify();
    await transporter.sendMail(testEmail);

    res.json({ message: 'SMTP-Test erfolgreich! Test-E-Mail wurde gesendet.' });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({ error: `SMTP-Test fehlgeschlagen: ${error.message}` });
  }
});

// Anwendungseinstellungen abrufen
router.get('/app', async (req, res) => {
  try {
    // Hier können weitere Anwendungseinstellungen hinzugefügt werden
    const settings = {
      appName: 'QR Scanner Party App',
      version: '1.0.0',
      maxGuests: 1000,
      allowBusinessEmails: true,
      requireEmailConfirmation: false
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching app settings:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Anwendungseinstellungen.' });
  }
});

// Anwendungseinstellungen speichern
router.post('/app', async (req, res) => {
  try {
    const { maxGuests, allowBusinessEmails, requireEmailConfirmation } = req.body;

    // Hier können die Einstellungen in der Datenbank gespeichert werden
    // Für jetzt geben wir nur eine Bestätigung zurück
    
    res.json({ message: 'Anwendungseinstellungen erfolgreich gespeichert.' });
  } catch (error) {
    console.error('Error saving app settings:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Anwendungseinstellungen.' });
  }
});



module.exports = router; 