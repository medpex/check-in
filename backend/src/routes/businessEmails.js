
const express = require('express');
const pool = require('../config/database');
const nodemailer = require('nodemailer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/business-emails/email-stats - Statistik versendeter Geschäftseinladungen (öffentlich)
router.get('/email-stats', async (req, res) => {
  try {
    console.log('📊 Business-Email-Statistiken werden abgerufen...');
    
    const totalResult = await pool.query(
      'SELECT COUNT(*) FROM business_emails WHERE email IS NOT NULL'
    );
    const totalEmails = parseInt(totalResult.rows[0].count, 10);
    
    const sentResult = await pool.query(
      'SELECT COUNT(*) FROM business_emails WHERE email_sent = TRUE'
    );
    const sentEmails = parseInt(sentResult.rows[0].count, 10);
    
    console.log(`📊 Business-Email-Statistiken: ${sentEmails} von ${totalEmails} versendet`);
    
    res.json({ totalEmails, sentEmails });
  } catch (error) {
    console.error('Fehler beim Abrufen der Business-Email-Statistiken:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Business-Email-Statistiken' });
  }
});

// Alle anderen Routen erfordern Authentifizierung und Admin-Berechtigung
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/business-emails - Alle berechtigten Geschäftsemails abrufen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, company, created_at, email_sent, email_sent_at FROM business_emails ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Geschäftsemails:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Geschäftsemails' });
  }
});

// POST /api/business-emails - Neue berechtigte Geschäftsemail hinzufügen
router.post('/', async (req, res) => {
  try {
    const { email, company } = req.body;

    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email ist erforderlich' });
    }

    // Prüfen ob Email bereits existiert
    const existingResult = await pool.query(
      'SELECT id FROM business_emails WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Diese Email ist bereits registriert' });
    }

    // Neue Email hinzufügen
    const result = await pool.query(
      'INSERT INTO business_emails (email, company) VALUES ($1, $2) RETURNING *',
      [email.toLowerCase().trim(), company || null]
    );

    console.log(`✅ Neue berechtigte Geschäftsemail hinzugefügt: ${email}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Geschäftsemail:', error);
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Geschäftsemail' });
  }
});

// DELETE /api/business-emails/:id - Geschäftsemail löschen
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query('SELECT email FROM business_emails WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Geschäftsemail nicht gefunden' });
    }

    const email = checkResult.rows[0].email;

    await pool.query('DELETE FROM business_emails WHERE id = $1', [id]);

    console.log(`🗑️ Geschäftsemail gelöscht: ${email}`);
    res.status(200).json({ message: 'Geschäftsemail erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Geschäftsemail:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Geschäftsemail' });
  }
});

// POST /api/business-emails/verify - Email-Verifizierung
router.post('/verify', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email ist erforderlich' });
    }

    const result = await pool.query(
      'SELECT id, email, company FROM business_emails WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Email-Verifizierung erfolgreich: ${email}`);
      res.json({ 
        verified: true, 
        email: result.rows[0].email,
        company: result.rows[0].company 
      });
    } else {
      console.log(`❌ Email-Verifizierung fehlgeschlagen: ${email}`);
      res.json({ verified: false });
    }
  } catch (error) {
    console.error('Fehler bei der Email-Verifizierung:', error);
    res.status(500).json({ error: 'Fehler bei der Email-Verifizierung' });
  }
});



// POST /api/business-emails/send-all-invitations - Alle ausstehenden Geschäftseinladungen versenden
router.post('/send-all-invitations', async (req, res) => {
  console.log('📧 Massenversand der Geschäftseinladungen gestartet...');
  let client;
  try {
    console.log('🔗 Verbinde zur Datenbank...');
    client = await pool.connect();
    console.log('✅ Datenbankverbindung hergestellt');
    // Geschäftsemails abrufen, die noch keine Einladung erhalten haben
    console.log('📊 Suche nach ausstehenden Geschäftsemails...');
    const emailsResult = await client.query(
      'SELECT * FROM business_emails WHERE email_sent = FALSE AND email IS NOT NULL'
    );
    const emailsToSend = emailsResult.rows;
    console.log(`📊 Gefunden: ${emailsToSend.length} ausstehende Geschäftsemails`);
    if (emailsToSend.length === 0) {
      console.log('📊 Keine ausstehenden Geschäftseinladungen gefunden');
      return res.status(200).json({ message: 'Keine ausstehenden Geschäftseinladungen zum Versenden.' });
    }
    // SMTP-Konfiguration abrufen
    const configResult = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    if (configResult.rows.length === 0) {
      return res.status(400).json({ error: 'Keine SMTP-Konfiguration gefunden.' });
    }
    const smtpConfig = configResult.rows[0];
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    for (const entry of emailsToSend) {
      try {
        // E-Mail senden
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password,
          },
        });
        const mailOptions = {
          from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
          to: entry.email,
          subject: 'Einladung zur Party-Registrierung',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">Sie sind eingeladen! 🎉</h2>
              <p style="font-size: 16px; color: #555;">Hallo,</p>
              <p style="font-size: 16px; color: #555;">Sie sind herzlich zu unserer Party eingeladen! Bitte registrieren Sie sich über den unten stehenden Link.</p>
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
              <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">Wir freuen uns auf Sie! 🎊</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #999; text-align: center;">Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.</p>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
        // Status aktualisieren
        await client.query(
          'UPDATE business_emails SET email_sent = TRUE, email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
          [entry.id]
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({ id: entry.id, error: error.message });
        console.error(`Fehler beim Senden der Geschäftseinladung an ${entry.email}:`, error);
      }
    }
    res.status(200).json({
      message: `${successCount} von ${emailsToSend.length} Geschäftseinladungen erfolgreich versendet.`,
      successCount,
      errorCount,
      errors,
    });
  } catch (error) {
    console.error('Fehler beim Massenversand der Geschäftseinladungen:', error);
    res.status(500).json({ error: 'Fehler beim Massenversand der Geschäftseinladungen' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
