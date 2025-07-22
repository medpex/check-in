
const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendInvitationEmail } = require('../services/emailService'); // Import email service
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Alle Routen erfordern Authentifizierung und Admin-Berechtigung
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/guests - Alle Gäste abrufen (mit optionalen Filtern)
router.get('/', async (req, res) => {
  try {
    const { main_guest_id, guest_type } = req.query;
    
    let query = 'SELECT id, name, email, qr_code, main_guest_id, guest_type, created_at, email_sent, email_sent_at FROM guests';
    let params = [];
    let conditions = [];
    
    // Filter nach main_guest_id
    if (main_guest_id) {
      conditions.push('main_guest_id = $' + (params.length + 1));
      params.push(main_guest_id);
    }
    
    // Filter nach guest_type
    if (guest_type) {
      conditions.push('guest_type = $' + (params.length + 1));
      params.push(guest_type);
    }
    
    // Füge WHERE-Klausel hinzu, wenn Filter vorhanden sind
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Gäste:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Gäste' });
  }
});

// POST /api/guests - Neuen Gast erstellen
router.post('/', async (req, res) => {
  try {
    const { name, email, main_guest_id, guest_type } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }

    // Validiere guest_type falls vorhanden
    if (guest_type && !['family', 'friends'].includes(guest_type)) {
      return res.status(400).json({ error: 'Ungültiger guest_type. Erlaubt: family, friends' });
    }

    // Wenn main_guest_id angegeben ist, prüfe ob der Hauptgast existiert
    if (main_guest_id) {
      const mainGuestCheck = await pool.query('SELECT id FROM guests WHERE id = $1', [main_guest_id]);
      if (mainGuestCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Hauptgast nicht gefunden' });
      }
    }

    const guestId = uuidv4();
    
    // QR-Code Daten erstellen
    const qrData = JSON.stringify({
      id: guestId,
      name: name.trim()
    });

    // QR-Code generieren
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Gast in Datenbank speichern
    const result = await pool.query(
      'INSERT INTO guests (id, name, email, qr_code, main_guest_id, guest_type, email_sent, email_sent_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [guestId, name.trim(), email || null, qrCodeDataUrl, main_guest_id || null, guest_type || null, false, null]
    );

    console.log(`✅ Neuer Gast erstellt: ${name} (${guestId})${main_guest_id ? ` - Zusatzgast für ${main_guest_id}` : ''}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Erstellen des Gastes:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Gastes' });
  }
});

// GET /api/guests/email-stats - E-Mail-Statistiken abrufen
router.get('/email-stats', async (req, res) => {
  try {
    // Gesamtzahl der Gäste mit einer E-Mail-Adresse
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM guests WHERE guest_type = 'business' AND email IS NOT NULL"
    );
    const totalEmails = parseInt(totalResult.rows[0].count, 10);

    // Anzahl der bereits versendeten E-Mails
    const sentResult = await pool.query(
      "SELECT COUNT(*) FROM guests WHERE guest_type = 'business' AND email_sent = TRUE"
    );
    const sentEmails = parseInt(sentResult.rows[0].count, 10);

    res.json({ totalEmails, sentEmails });
  } catch (error) {
    console.error('Fehler beim Abrufen der E-Mail-Statistiken:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der E-Mail-Statistiken' });
  }
});

// POST /api/guests/send-all-invitations - Alle ausstehenden Einladungen versenden
router.post('/send-all-invitations', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    
    // Gäste abrufen, die noch keine E-Mail erhalten haben
    const guestsResult = await client.query(
      "SELECT * FROM guests WHERE guest_type = 'business' AND email_sent = FALSE AND email IS NOT NULL"
    );
    const guestsToSend = guestsResult.rows;

    if (guestsToSend.length === 0) {
      return res.status(200).json({ message: 'Keine ausstehenden Einladungen zum Versenden.' });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // SMTP-Konfiguration abrufen
    const configResult = await client.query('SELECT * FROM smtp_config ORDER BY created_at DESC LIMIT 1');
    if (configResult.rows.length === 0) {
      return res.status(400).json({ error: 'Keine SMTP-Konfiguration gefunden.' });
    }
    const smtpConfig = configResult.rows[0];

    // Über alle Gäste iterieren und E-Mails versenden
    for (const guest of guestsToSend) {
      try {
        await sendInvitationEmail(guest, smtpConfig);
        
        // E-Mail-Status in der Datenbank aktualisieren
        await client.query(
          'UPDATE guests SET email_sent = TRUE, email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
          [guest.id]
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({ guestId: guest.id, error: error.message });
        console.error(`Fehler beim Senden der E-Mail an ${guest.email}:`, error);
      }
    }

    res.status(200).json({
      message: `${successCount} von ${guestsToSend.length} Einladungen erfolgreich versendet.`,
      successCount,
      errorCount,
      errors,
    });
  } catch (error) {
    console.error('Fehler beim Massenversand der Einladungen:', error);
    res.status(500).json({ error: 'Fehler beim Massenversand der Einladungen' });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// PATCH /api/guests/:id/email-status - E-Mail Status aktualisieren
router.patch('/:id/email-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { email_sent, email_sent_at } = req.body;

    // Prüfen ob Gast existiert
    const checkResult = await pool.query('SELECT id FROM guests WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gast nicht gefunden' });
    }

    // E-Mail Status aktualisieren
    const result = await pool.query(
      'UPDATE guests SET email_sent = $1, email_sent_at = $2 WHERE id = $3 RETURNING *',
      [email_sent, email_sent_at, id]
    );

    console.log(`📧 E-Mail Status aktualisiert für Gast ${id}: ${email_sent ? 'versendet' : 'nicht versendet'}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des E-Mail Status:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des E-Mail Status' });
  }
});

// DELETE /api/guests/:id - Gast löschen
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prüfen ob Gast existiert
    const checkResult = await pool.query('SELECT name FROM guests WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gast nicht gefunden' });
    }

    const guestName = checkResult.rows[0].name;

    // Gast löschen (CASCADE löscht auch Check-ins und zusätzliche Gäste)
    await pool.query('DELETE FROM guests WHERE id = $1', [id]);

    console.log(`🗑️ Gast gelöscht: ${guestName} (${id})`);
    res.status(200).json({ message: 'Gast erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Gastes:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Gastes' });
  }
});

module.exports = router;
