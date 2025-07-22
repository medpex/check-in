const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich.' });
    }

    // Benutzer in der Datenbank suchen
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
    }

    const user = result.rows[0];

    // Passwort überprüfen
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Token in der Datenbank speichern
    await pool.query(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'24 hours\')',
      [user.id, token]
    );

    res.json({
      message: 'Erfolgreich angemeldet.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Token aus der Datenbank entfernen
    await pool.query(
      'DELETE FROM user_sessions WHERE token_hash = $1',
      [token]
    );

    res.json({ message: 'Erfolgreich abgemeldet.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Passwort ändern
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Aktuelles und neues Passwort erforderlich.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Das neue Passwort muss mindestens 6 Zeichen lang sein.' });
    }

    // Aktuelles Passwort überprüfen
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Aktuelles Passwort ist falsch.' });
    }

    // Neues Passwort hashen und speichern
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    // Alle Sessions des Benutzers löschen (erzwungene Abmeldung)
    await pool.query(
      'DELETE FROM user_sessions WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ message: 'Passwort erfolgreich geändert. Sie wurden abgemeldet.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Aktuellen Benutzer abrufen
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Token validieren
router.get('/validate', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router; 