
const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

const router = express.Router();

// GET /api/guests - Alle Gäste abrufen (mit optionalen Filtern)
router.get('/', async (req, res) => {
  try {
    const { main_guest_id, guest_type } = req.query;
    
    let query = 'SELECT id, name, email, qr_code, main_guest_id, guest_type, created_at FROM guests';
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
      'INSERT INTO guests (id, name, email, qr_code, main_guest_id, guest_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [guestId, name.trim(), email || null, qrCodeDataUrl, main_guest_id || null, guest_type || null]
    );

    console.log(`✅ Neuer Gast erstellt: ${name} (${guestId})${main_guest_id ? ` - Zusatzgast für ${main_guest_id}` : ''}`);
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
