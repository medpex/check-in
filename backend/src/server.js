
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const guestRoutes = require('./routes/guests');
const checkinRoutes = require('./routes/checkins');
const businessEmailRoutes = require('./routes/businessEmails');

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

// Routes
app.use('/api/guests', guestRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/business-emails', businessEmailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cors_origins: corsOrigins
  });
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
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📡 API verfügbar unter http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
