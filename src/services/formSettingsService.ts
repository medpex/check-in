import { apiUrl } from '@/config/api';

export interface FormSettings {
  id?: number;
  background_color: string;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

class FormSettingsService {
  async getFormSettings(): Promise<FormSettings> {
    try {
      const response = await fetch(apiUrl('/settings/form'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching form settings:', error);
      // Return default settings if there's an error
      return {
        background_color: '#3B82F6',
        logo_url: null
      };
    }
  }

  async saveFormSettings(settings: Omit<FormSettings, 'id' | 'created_at' | 'updated_at'>): Promise<FormSettings> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(apiUrl('/settings/form'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving form settings:', error);
      throw error;
    }
  }
}

export const formSettingsService = new FormSettingsService(); 