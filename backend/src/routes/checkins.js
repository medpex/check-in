
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

const router = express.Router();

// GET /api/checkins - Alle eingecheckten Gäste abrufen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.guest_id, c.name, c.timestamp 
      FROM checkins c 
      ORDER BY c.timestamp DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Check-ins:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Check-ins' });
  }
});

// POST /api/checkins - Gast einchecken
router.post('/', async (req, res) => {
  try {
    const { guest_id, name, timestamp } = req.body;

    if (!guest_id || !name) {
      return res.status(400).json({ error: 'guest_id und name sind erforderlich' });
    }

    // Prüfen ob Gast existiert
    const guestCheck = await pool.query('SELECT id FROM guests WHERE id = $1', [guest_id]);
    if (guestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Gast nicht gefunden' });
    }

    // Prüfen ob bereits eingecheckt
    const existingCheckin = await pool.query(
      'SELECT id FROM checkins WHERE guest_id = $1',
      [guest_id]
    );

    if (existingCheckin.rows.length > 0) {
      return res.status(409).json({ error: 'Guest already checked in' });
    }

    // Check-in erstellen
    const checkinId = uuidv4();
    const checkinTimestamp = timestamp || new Date().toISOString();

    const result = await pool.query(
      'INSERT INTO checkins (id, guest_id, name, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [checkinId, guest_id, name, checkinTimestamp]
    );

    console.log(`✅ Check-in: ${name} (${guest_id})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Check-in:', error);
    res.status(500).json({ error: 'Fehler beim Check-in' });
  }
});

// DELETE /api/checkins/:guest_id - Gast auschecken
router.delete('/:guest_id', async (req, res) => {
  try {
    const { guest_id } = req.params;

    // Prüfen ob Gast eingecheckt ist
    const checkResult = await pool.query(
      'SELECT name FROM checkins WHERE guest_id = $1',
      [guest_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guest not checked in' });
    }

    const guestName = checkResult.rows[0].name;

    // Check-in entfernen
    await pool.query('DELETE FROM checkins WHERE guest_id = $1', [guest_id]);

    console.log(`❌ Check-out: ${guestName} (${guest_id})`);
    res.status(200).json({ message: 'Gast erfolgreich ausgecheckt' });
  } catch (error) {
    console.error('Fehler beim Check-out:', error);
    res.status(500).json({ error: 'Fehler beim Check-out' });
  }
});

module.exports = router;
