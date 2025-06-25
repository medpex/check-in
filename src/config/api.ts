
// API Konfiguration mit Fallback-Logik
const getApiUrl = () => {
  // Versuche zuerst die Umgebungsvariable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: Versuche verschiedene lokale URLs
  const hostname = window.location.hostname;
  
  // Wenn wir auf localhost sind, nutze localhost für API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // Sonst nutze die gleiche IP wie das Frontend
  return `http://${hostname}:3001/api`;
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  ENDPOINTS: {
    GUESTS: '/guests',
    CHECKINS: '/checkins',
    BUSINESS_EMAILS: '/business-emails',
  }
};

export const apiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.BASE_URL;
  console.log(`🔗 API Request: ${baseUrl}${endpoint}`);
  return `${baseUrl}${endpoint}`;
};

// Hilfsfunktion zum Testen der API-Verbindung
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(apiUrl('/health'));
    const result = response.ok;
    console.log(`🏥 API Health Check: ${result ? '✅ OK' : '❌ FAILED'}`);
    return result;
  } catch (error) {
    console.error('🚨 API Connection Test Failed:', error);
    return false;
  }
};
