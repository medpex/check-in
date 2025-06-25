
const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

const router = express.Router();

// GET /api/guests - Alle Gäste abrufen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, qr_code, created_at FROM guests ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Gäste:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Gäste' });
  }
});

// POST /api/guests - Neuen Gast erstellen
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name ist erforderlich' });
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
      'INSERT INTO guests (id, name, email, qr_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [guestId, name.trim(), email || null, qrCodeDataUrl]
    );

    console.log(`✅ Neuer Gast erstellt: ${name} (${guestId})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Fehler beim Erstellen des Gastes:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Gastes' });
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

    // Gast löschen (CASCADE löscht auch Check-ins)
    await pool.query('DELETE FROM guests WHERE id = $1', [id]);

    console.log(`🗑️ Gast gelöscht: ${guestName} (${id})`);
    res.status(200).json({ message: 'Gast erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Gastes:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Gastes' });
  }
});

module.exports = router;
