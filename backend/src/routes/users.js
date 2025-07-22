const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Alle Routen erfordern Authentifizierung und Admin-Rechte
router.use(authenticateToken);
router.use(requireAdmin);

// Alle Benutzer abrufen
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Neuen Benutzer erstellen
router.post('/', async (req, res) => {
  try {
    const { username, password, email, role = 'scanner' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich.' });
    }

    // Prüfen ob Benutzername bereits existiert
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Benutzername bereits vergeben.' });
    }

    // Passwort hashen
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Benutzer erstellen
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, email, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, is_active, created_at',
      [username, passwordHash, email, role, true]
    );

    console.log(`✅ Neuer Benutzer erstellt: ${username} (${role})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Benutzer aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, is_active } = req.body;

    // Prüfen ob Benutzer existiert
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    // Prüfen ob neuer Benutzername bereits existiert (außer bei sich selbst)
    if (username) {
      const usernameExists = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
      );

      if (usernameExists.rows.length > 0) {
        return res.status(409).json({ error: 'Benutzername bereits vergeben.' });
      }
    }

    // Benutzer aktualisieren
    const result = await pool.query(
      'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), role = COALESCE($3, role), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING id, username, email, role, is_active, created_at, updated_at',
      [username, email, role, is_active, id]
    );

    console.log(`✅ Benutzer aktualisiert: ${result.rows[0].username}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Passwort ändern
router.patch('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Neues Passwort ist erforderlich.' });
    }

    // Prüfen ob Benutzer existiert
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    // Passwort hashen
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Passwort aktualisieren
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, id]
    );

    console.log(`✅ Passwort für Benutzer ID ${id} geändert`);
    res.json({ message: 'Passwort erfolgreich geändert.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Benutzer löschen
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prüfen ob Benutzer existiert
    const existingUser = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    // Verhindern dass Admin sich selbst löscht
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Sie können sich nicht selbst löschen.' });
    }

    // Benutzer löschen
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    console.log(`🗑️ Benutzer gelöscht: ${existingUser.rows[0].username} (${id})`);
    res.json({ message: 'Benutzer erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

module.exports = router; 