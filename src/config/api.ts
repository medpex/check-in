import { APP_CONFIG } from './app';

// API Konfiguration mit zentraler App-Konfiguration
export const API_CONFIG = {
  BASE_URL: APP_CONFIG.API.BASE_URL,
  ENDPOINTS: {
    GUESTS: '/guests',
    CHECKINS: '/checkins',
    BUSINESS_EMAILS: '/business-emails',
    SMTP: '/smtp',
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
