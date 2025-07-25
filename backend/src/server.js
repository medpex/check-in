
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const guestRoutes = require('./routes/guests');
const checkinRoutes = require('./routes/checkins');
const businessEmailRoutes = require('./routes/businessEmails');
const smtpRoutes = require('./routes/smtp');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/users');
const timeLimitRoutes = require('./routes/timeLimit');

// TimeLimit Service importieren
const timeLimitService = require('./services/timeLimitService');
const { timeLimitMiddleware, readOnlyMiddleware } = require('./middleware/timeLimitMiddleware');
const bcrypt = require('bcrypt');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS-Origins aus Umgebungsvariable parsen
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8080'];

console.log('🌐 Erlaubte CORS-Origins:', corsOrigins);

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Für Development: Alle localhost und 127.0.0.1 Origins erlauben
    if (process.env.NODE_ENV === 'development' && 
        (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    console.warn('🚫 CORS-Fehler für Origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// TimeLimit Middleware vor allen Routes
app.use(timeLimitMiddleware);
app.use(readOnlyMiddleware);

// Routes
app.use('/api/guests', guestRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/business-emails', businessEmailRoutes);
app.use('/api/smtp', smtpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/time-limit', timeLimitRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const timeLimitCheck = await timeLimitService.checkTimeLimit();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      cors_origins: corsOrigins,
      timeLimit: {
        isExpired: timeLimitCheck.isExpired,
        message: timeLimitCheck.message,
        timeRemainingMinutes: Math.floor(timeLimitCheck.timeRemaining / (60 * 1000)),
        isReadOnly: timeLimitService.isReadOnly()
      },
      routes: [
        '/api/guests',
        '/api/checkins', 
        '/api/business-emails',
        '/api/smtp',
        '/api/auth',
        '/api/settings',
        '/api/users',
        '/api/time-limit'
      ]
    });
  } catch (error) {
    console.error('Fehler im Health Check:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Health check fehlgeschlagen'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route nicht gefunden: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📡 API verfügbar unter http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📧 SMTP Routes: http://localhost:${PORT}/api/smtp/*`);
  console.log(`⏰ TimeLimit Routes: http://localhost:${PORT}/api/time-limit/*`);
  
  // Initiale Daten einrichten
  try {
    console.log('🔧 Initialisiere Standard-Daten...');
    
    // Admin-Benutzer einrichten
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (existingUser.rows.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash, email, role) VALUES ($1, $2, $3, $4)',
        ['admin', passwordHash, 'admin@example.com', 'admin']
      );
      console.log('✅ Admin-Benutzer erstellt (admin/admin123)');
    } else {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [passwordHash, 'admin']);
      console.log('✅ Admin-Passwort zurückgesetzt (admin/admin123)');
    }
    
    // Installationsinfo einrichten
    const installInfo = await pool.query('SELECT COUNT(*) as count FROM install_info');
    if (parseInt(installInfo.rows[0].count) === 0) {
      await pool.query('INSERT INTO install_info (installed_at, version) VALUES (CURRENT_TIMESTAMP, $1)', ['1.0.0']);
      console.log('✅ Installationsinfo erstellt');
    }
    
    console.log('✅ Initiale Daten erfolgreich eingerichtet');
  } catch (error) {
    console.error('❌ Fehler beim Einrichten der initialen Daten:', error);
  }
  
  // Initiale Zeitbegrenzungsprüfung beim Serverstart
  try {
    const timeLimitCheck = await timeLimitService.checkTimeLimit();
    console.log(`⏰ Zeitbegrenzungsstatus: ${timeLimitCheck.message}`);
    
    if (timeLimitCheck.isExpired) {
      console.log(`⚠️  WARNUNG: Zeitbegrenzung überschritten! Anwendung läuft im Read-Only Modus.`);
    }
  } catch (error) {
    console.error('❌ Fehler bei der initialen Zeitbegrenzungsprüfung:', error);
  }
});

module.exports = app;
