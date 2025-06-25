
// API Konfiguration mit vereinfachter Logik
const getApiUrl = () => {
  // Verwende die Umgebungsvariable falls gesetzt
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback: Verwende die aktuelle Domain mit Port 3001
  const hostname = window.location.hostname;
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

// Verbesserte Hilfsfunktion zum Testen der API-Verbindung
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 Sekunden Timeout
    
    const response = await fetch(apiUrl('/health'), {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    const result = response.ok;
    console.log(`🏥 API Health Check: ${result ? '✅ OK' : '❌ FAILED'} (${response.status})`);
    return result;
  } catch (error) {
    console.error('🚨 API Connection Test Failed:', error);
    return false;
  }
};
