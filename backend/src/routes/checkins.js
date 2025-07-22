
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Alle Routen erfordern Authentifizierung und Admin-Berechtigung
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/checkins - Alle eingecheckten Gäste abrufen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.guest_id, c.guest_name as name, c.checked_in_at as timestamp 
      FROM checkins c 
      ORDER BY c.checked_in_at DESC
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
    console.log('🔍 Check-in Request erhalten:', req.body);
    const { guest_id, name, timestamp } = req.body;

    if (!guest_id || !name) {
      console.log('❌ Check-in Fehler: guest_id oder name fehlt');
      return res.status(400).json({ error: 'guest_id und name sind erforderlich' });
    }

    // Prüfen ob Gast existiert
    console.log('🔍 Prüfe ob Gast existiert:', guest_id);
    const guestCheck = await pool.query('SELECT id FROM guests WHERE id = $1', [guest_id]);
    if (guestCheck.rows.length === 0) {
      console.log('❌ Gast nicht gefunden:', guest_id);
      return res.status(404).json({ error: 'Gast nicht gefunden' });
    }
    console.log('✅ Gast gefunden:', guest_id);

    // Prüfen ob bereits eingecheckt
    console.log('🔍 Prüfe ob bereits eingecheckt:', guest_id);
    const existingCheckin = await pool.query(
      'SELECT id FROM checkins WHERE guest_id = $1',
      [guest_id]
    );

    if (existingCheckin.rows.length > 0) {
      console.log('❌ Gast bereits eingecheckt:', guest_id);
      return res.status(409).json({ error: 'Guest already checked in' });
    }
    console.log('✅ Gast noch nicht eingecheckt');

    // Check-in erstellen
    const checkinTimestamp = timestamp || new Date().toISOString();
    console.log('🔍 Erstelle Check-in für:', { guest_id, name, checkinTimestamp });

    const result = await pool.query(
      'INSERT INTO checkins (guest_id, guest_name, checked_in_at) VALUES ($1, $2, $3) RETURNING *',
      [guest_id, name, checkinTimestamp]
    );

    console.log(`✅ Check-in erfolgreich: ${name} (${guest_id})`);
    res.status(201).json({
      id: result.rows[0].id,
      guest_id: result.rows[0].guest_id,
      name: result.rows[0].guest_name,
      timestamp: result.rows[0].checked_in_at
    });
  } catch (error) {
    console.error('❌ Fehler beim Check-in:', error);
    console.error('❌ Error Stack:', error.stack);
    res.status(500).json({ error: 'Fehler beim Check-in' });
  }
});

// DELETE /api/checkins/:guest_id - Gast auschecken
router.delete('/:guest_id', async (req, res) => {
  try {
    const { guest_id } = req.params;

    // Prüfen ob Gast eingecheckt ist
    const checkResult = await pool.query(
      'SELECT guest_name FROM checkins WHERE guest_id = $1',
      [guest_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Guest not checked in' });
    }

    const guestName = checkResult.rows[0].guest_name;

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
