const express = require('express');
const router = express.Router();
const timeLimitService = require('../services/timeLimitService');

/**
 * GET /api/time-limit/status
 * Gibt den aktuellen Status der Zeitbegrenzung zurück
 */
router.get('/status', async (req, res) => {
  try {
    const timeLimitCheck = await timeLimitService.checkTimeLimit();
    const timeLimitInfo = timeLimitService.getTimeLimitInfo();

    res.json({
      status: 'success',
      data: {
        isExpired: timeLimitCheck.isExpired,
        message: timeLimitCheck.message,
        installedAt: timeLimitCheck.installedAt,
        timeRemaining: timeLimitCheck.timeRemaining,
        timeRemainingMinutes: Math.floor(timeLimitCheck.timeRemaining / (60 * 1000)),
        timeLimitMinutes: timeLimitInfo.timeLimitMinutes,
        isReadOnly: timeLimitInfo.isReadOnly,
        currentTime: new Date()
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Zeitbegrenzungsstatus:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Abrufen des Zeitbegrenzungsstatus'
    });
  }
});

/**
 * GET /api/time-limit/display
 * Gibt eine einfache HTML-Seite mit Zeitbegrenzungsinformationen zurück
 */
router.get('/display', async (req, res) => {
  try {
    const timeLimitCheck = await timeLimitService.checkTimeLimit();
    const timeLimitInfo = timeLimitService.getTimeLimitInfo();
    
    const timeRemainingMinutes = Math.floor(timeLimitCheck.timeRemaining / (60 * 1000));
    const timeRemainingSeconds = Math.floor((timeLimitCheck.timeRemaining % (60 * 1000)) / 1000);
    
    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeitbegrenzung - QR Scanner</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status {
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .status.expired {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ffcdd2;
        }
        .status.active {
            background-color: #e8f5e8;
            color: #2e7d32;
            border: 1px solid #c8e6c9;
        }
        .warning {
            background-color: #fff3e0;
            color: #ef6c00;
            border: 1px solid #ffcc02;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .time-display {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .button.danger {
            background-color: #dc3545;
        }
        .button.danger:hover {
            background-color: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⏰ Zeitbegrenzung Status</h1>
        
        <div class="status ${timeLimitCheck.isExpired ? 'expired' : 'active'}">
            ${timeLimitCheck.isExpired ? '⚠️ ZEITBEGRENZUNG ÜBERSCHRITTEN' : '✅ ANWENDUNG AKTIV'}
        </div>
        
        <div class="time-display">
            ${timeLimitCheck.isExpired ? 
                'Zeit abgelaufen' : 
                `Verbleibende Zeit: ${timeRemainingMinutes}:${timeRemainingSeconds.toString().padStart(2, '0')}`
            }
        </div>
        
        <div class="info">
            <strong>Installationszeitpunkt:</strong><br>
            ${new Date(timeLimitCheck.installedAt).toLocaleString('de-DE')}
        </div>
        
        <div class="info">
            <strong>Zeitbegrenzung:</strong> ${timeLimitInfo.timeLimitMinutes} Minuten<br>
            <strong>Modus:</strong> ${timeLimitInfo.isReadOnly ? 'Read-Only' : 'Vollzugriff'}
        </div>
        
        ${timeLimitCheck.isExpired ? `
            <div class="warning">
                <strong>Wichtige Information:</strong><br>
                Die Testlaufzeit von ${timeLimitInfo.timeLimitMinutes} Minuten ist abgelaufen. 
                Bitte kontaktieren Sie den Entwickler für eine Freischaltung.
            </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/api/health" class="button">Health Check</a>
            <a href="/api/time-limit/status" class="button">JSON Status</a>
            ${process.env.NODE_ENV === 'development' ? 
                '<a href="#" onclick="resetTimeLimit()" class="button danger">Reset (Dev)</a>' : 
                ''
            }
        </div>
    </div>
    
    <script>
        function resetTimeLimit() {
            if (confirm('Installationszeit zurücksetzen? (Nur für Entwickler)')) {
                fetch('/api/time-limit/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    location.reload();
                })
                .catch(error => {
                    alert('Fehler beim Zurücksetzen: ' + error);
                });
            }
        }
        
        // Auto-refresh alle 30 Sekunden
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error('Fehler beim Generieren der Zeitbegrenzungsanzeige:', error);
    res.status(500).send('Fehler beim Laden der Zeitbegrenzungsanzeige');
  }
});

/**
 * POST /api/time-limit/reset
 * Setzt die Installationszeit zurück (nur für Entwickler)
 * Erfordert einen Entwickler-Token oder spezielle Umgebungsvariable
 */
router.post('/reset', async (req, res) => {
  try {
    // Sicherheitscheck - nur in Development oder mit speziellem Token
    const isDevelopment = process.env.NODE_ENV === 'development';
    const developerToken = process.env.DEVELOPER_TOKEN;
    const providedToken = req.headers['x-developer-token'];

    if (!isDevelopment && (!developerToken || providedToken !== developerToken)) {
      return res.status(403).json({
        status: 'error',
        message: 'Nicht autorisiert - Reset nur für Entwickler verfügbar'
      });
    }

    // Installationszeit zurücksetzen
    await timeLimitService.initializeInstallInfo();
    
    console.log('🔄 Installationszeitpunkt zurückgesetzt');
    
    res.json({
      status: 'success',
      message: 'Installationszeitpunkt erfolgreich zurückgesetzt',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Fehler beim Zurücksetzen der Installationszeit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler beim Zurücksetzen der Installationszeit'
    });
  }
});

/**
 * POST /api/time-limit/configure
 * Konfiguriert die Zeitbegrenzung (nur für Entwickler)
 */
router.post('/configure', async (req, res) => {
  try {
    const { timeLimitMinutes } = req.body;
    
    // Sicherheitscheck
    const isDevelopment = process.env.NODE_ENV === 'development';
    const developerToken = process.env.DEVELOPER_TOKEN;
    const providedToken = req.headers['x-developer-token'];

    if (!isDevelopment && (!developerToken || providedToken !== developerToken)) {
      return res.status(403).json({
        status: 'error',
        message: 'Nicht autorisiert - Konfiguration nur für Entwickler verfügbar'
      });
    }

    if (!timeLimitMinutes || isNaN(timeLimitMinutes) || timeLimitMinutes <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Ungültige Zeitbegrenzung - muss eine positive Zahl sein'
      });
    }

    timeLimitService.setTimeLimit(parseInt(timeLimitMinutes));
    
    res.json({
      status: 'success',
      message: `Zeitbegrenzung auf ${timeLimitMinutes} Minuten gesetzt`,
      timeLimitMinutes: parseInt(timeLimitMinutes)
    });
  } catch (error) {
    console.error('Fehler bei der Zeitbegrenzungskonfiguration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Fehler bei der Zeitbegrenzungskonfiguration'
    });
  }
});

module.exports = router; 