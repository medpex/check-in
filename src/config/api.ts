
// API Konfiguration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://10.0.0.61:3001/api',
  ENDPOINTS: {
    GUESTS: '/guests',
    CHECKINS: '/checkins',
  }
};

export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;
