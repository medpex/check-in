const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware zur Überprüfung des JWT Tokens
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Zugriff verweigert. Token erforderlich.' });
  }

  try {
    // Token verifizieren
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Prüfen ob Token in der Blacklist ist
    const result = await pool.query(
      'SELECT * FROM user_sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Token ist ungültig oder abgelaufen.' });
    }

    // Benutzer-Informationen zur Request hinzufügen
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Ungültiger Token.' });
  }
};

// Middleware zur Überprüfung der Admin-Rolle
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin-Berechtigung erforderlich.' });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
}; 