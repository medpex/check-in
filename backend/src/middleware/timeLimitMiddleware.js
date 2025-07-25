const timeLimitService = require('../services/timeLimitService');

/**
 * Middleware für die Zeitbegrenzungsprüfung
 * Prüft bei jedem Request, ob die Zeitbegrenzung überschritten wurde
 */
const timeLimitMiddleware = async (req, res, next) => {
  try {
    // Ausnahmen für bestimmte Endpunkte
    const excludedPaths = [
      '/api/health',
      '/api/time-limit/status',
      '/api/time-limit/reset' // Nur für Entwickler
    ];

    if (excludedPaths.includes(req.path)) {
      return next();
    }

    const timeLimitCheck = await timeLimitService.checkTimeLimit();

    if (timeLimitCheck.isExpired) {
      // Zeitbegrenzung überschritten - Read-Only Modus oder Blockierung
      if (req.method !== 'GET') {
        // POST, PUT, DELETE Requests blockieren
        return res.status(403).json({
          error: 'Zeitbegrenzung überschritten',
          message: timeLimitCheck.message,
          code: 'TIME_LIMIT_EXPIRED',
          installedAt: timeLimitCheck.installedAt,
          timeLimitMinutes: timeLimitService.getTimeLimitInfo().timeLimitMinutes
        });
      } else {
        // GET Requests erlauben, aber Warnung hinzufügen
        req.timeLimitWarning = timeLimitCheck.message;
      }
    }

    // Zeitbegrenzungsinfo für alle Requests verfügbar machen
    req.timeLimitInfo = {
      isExpired: timeLimitCheck.isExpired,
      message: timeLimitCheck.message,
      installedAt: timeLimitCheck.installedAt,
      timeRemaining: timeLimitCheck.timeRemaining,
      isReadOnly: timeLimitService.isReadOnly()
    };

    next();
  } catch (error) {
    console.error('Fehler im TimeLimit Middleware:', error);
    // Bei Fehlern erlauben wir den Request
    next();
  }
};

/**
 * Middleware für Read-Only Modus
 * Verhindert Schreiboperationen wenn Zeitbegrenzung überschritten
 */
const readOnlyMiddleware = (req, res, next) => {
  if (timeLimitService.isReadOnly() && req.method !== 'GET') {
    return res.status(403).json({
      error: 'Read-Only Modus aktiv',
      message: 'Die Anwendung läuft im Read-Only Modus aufgrund der abgelaufenen Zeitbegrenzung.',
      code: 'READ_ONLY_MODE'
    });
  }
  next();
};

module.exports = {
  timeLimitMiddleware,
  readOnlyMiddleware
}; 