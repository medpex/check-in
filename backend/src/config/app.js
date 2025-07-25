// Backend App-Konfiguration
const APP_CONFIG = {
  // Basis-URL der Anwendung (kann über Umgebungsvariable überschrieben werden)
  BASE_URL: process.env.APP_BASE_URL || 'https://check-in.home-ki.eu',
  
  // Anwendungsname
  NAME: 'Check-In Tool',
  
  // Version
  VERSION: '1.0.0',
};

// Hilfsfunktionen für URLs
const getAppUrl = (path = '') => {
  const baseUrl = APP_CONFIG.BASE_URL.replace(/\/$/, ''); // Entferne trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const getFormularUrl = () => getAppUrl('/formular');
const getAdminUrl = () => getAppUrl('/admin');

// Logging für Debugging
console.log('🔧 Backend App Config:', {
  BASE_URL: APP_CONFIG.BASE_URL,
  FORMULAR_URL: getFormularUrl(),
  ADMIN_URL: getAdminUrl(),
});

module.exports = {
  APP_CONFIG,
  getAppUrl,
  getFormularUrl,
  getAdminUrl,
}; 