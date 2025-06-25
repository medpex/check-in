
const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/business-emails - Alle berechtigten Geschäftsemails abrufen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, company, created_at FROM business_emails ORDER BY created_at DESC'
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

module.exports = router;
