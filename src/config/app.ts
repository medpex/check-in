// Zentrale App-Konfiguration
export const APP_CONFIG = {
  // Basis-URL der Anwendung (kann über Umgebungsvariable überschrieben werden)
  BASE_URL: import.meta.env.VITE_APP_BASE_URL || 'https://check-in.home-ki.eu',
  
  // API-Konfiguration
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || 'https://check-in.home-ki.eu/api',
  },
  
  // Anwendungsname
  NAME: 'Check-In Tool',
  
  // Version
  VERSION: '1.0.0',
};

// Hilfsfunktionen für URLs
export const getAppUrl = (path: string = '') => {
  const baseUrl = APP_CONFIG.BASE_URL.replace(/\/$/, ''); // Entferne trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getFormularUrl = () => getAppUrl('/formular');
export const getAdminUrl = () => getAppUrl('/admin');

// Logging für Debugging
console.log('🔧 App Config:', {
  BASE_URL: APP_CONFIG.BASE_URL,
  API_BASE_URL: APP_CONFIG.API.BASE_URL,
  FORMULAR_URL: getFormularUrl(),
  ADMIN_URL: getAdminUrl(),
}); 