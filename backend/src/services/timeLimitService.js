const pool = require('../config/database');

class TimeLimitService {
  constructor() {
    this.timeLimitMinutes = process.env.TIME_LIMIT_MINUTES || 20; // Standard: 20 Minuten
    this.isReadOnlyMode = false;
  }

  /**
   * Prüft, ob die Zeitbegrenzung überschritten wurde
   * @returns {Promise<{isExpired: boolean, message: string, installedAt: Date, timeRemaining: number}>}
   */
  async checkTimeLimit() {
    try {
      const result = await pool.query(
        'SELECT installed_at FROM install_info ORDER BY id ASC LIMIT 1'
      );

      if (result.rows.length === 0) {
        // Kein Eintrag gefunden, erstelle einen neuen
        await this.initializeInstallInfo();
        return {
          isExpired: false,
          message: 'Installationszeitpunkt initialisiert',
          installedAt: new Date(),
          timeRemaining: this.timeLimitMinutes * 60 * 1000
        };
      }

      const installedAt = new Date(result.rows[0].installed_at);
      const now = new Date();
      const timeDiff = now.getTime() - installedAt.getTime();
      const timeLimitMs = this.timeLimitMinutes * 60 * 1000;
      const timeRemaining = timeLimitMs - timeDiff;

      const isExpired = timeDiff > timeLimitMs;

      if (isExpired) {
        this.isReadOnlyMode = true;
        return {
          isExpired: true,
          message: `Die Testlaufzeit von ${this.timeLimitMinutes} Minuten ist abgelaufen. Bitte kontaktieren Sie den Entwickler für eine Freischaltung.`,
          installedAt,
          timeRemaining: 0
        };
      }

      // Zeitbegrenzung nicht abgelaufen - Read-Only Modus deaktivieren
      this.isReadOnlyMode = false;
      
      return {
        isExpired: false,
        message: `Anwendung läuft normal. Verbleibende Zeit: ${Math.floor(timeRemaining / (60 * 1000))} Minuten`,
        installedAt,
        timeRemaining
      };
    } catch (error) {
      console.error('Fehler bei der Zeitbegrenzungsprüfung:', error);
      // Bei Datenbankfehlern erlauben wir den Betrieb
      return {
        isExpired: false,
        message: 'Zeitbegrenzungsprüfung fehlgeschlagen, Anwendung läuft im Notfallmodus',
        installedAt: new Date(),
        timeRemaining: this.timeLimitMinutes * 60 * 1000
      };
    }
  }

  /**
   * Initialisiert die Installationsinfo
   */
  async initializeInstallInfo() {
    try {
      await pool.query(
        'INSERT INTO install_info (installed_at, version) VALUES (CURRENT_TIMESTAMP, $1)',
        ['1.0.0']
      );
      console.log('✅ Installationszeitpunkt initialisiert');
    } catch (error) {
      console.error('Fehler beim Initialisieren der Installationsinfo:', error);
    }
  }

  /**
   * Prüft, ob die Anwendung im Read-Only Modus laufen soll
   */
  isReadOnly() {
    return this.isReadOnlyMode;
  }

  /**
   * Setzt die Zeitbegrenzung (für Tests oder Konfiguration)
   */
  setTimeLimit(minutes) {
    this.timeLimitMinutes = minutes;
    console.log(`⏰ Zeitbegrenzung auf ${minutes} Minuten gesetzt`);
  }

  /**
   * Gibt Informationen über die aktuelle Zeitbegrenzung zurück
   */
  getTimeLimitInfo() {
    return {
      timeLimitMinutes: this.timeLimitMinutes,
      isReadOnly: this.isReadOnlyMode
    };
  }
}

module.exports = new TimeLimitService(); 