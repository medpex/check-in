
import { apiUrl, API_CONFIG } from '@/config/api';

export interface Guest {
  id: string;
  name: string;
  qr_code: string;
  created_at?: string;
}

export interface CheckedInGuest {
  id: string;
  guest_id: string;
  name: string;
  timestamp: string;
}

class GuestService {
  async createGuest(name: string): Promise<Guest> {
    const response = await fetch(apiUrl(API_CONFIG.ENDPOINTS.GUESTS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create guest');
    }

    return response.json();
  }

  async getAllGuests(): Promise<Guest[]> {
    const response = await fetch(apiUrl(API_CONFIG.ENDPOINTS.GUESTS));
    
    if (!response.ok) {
      throw new Error('Failed to fetch guests');
    }

    return response.json();
  }

  async deleteGuest(guestId: string): Promise<void> {
    const response = await fetch(apiUrl(`${API_CONFIG.ENDPOINTS.GUESTS}/${guestId}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete guest');
    }
  }

  async checkInGuest(guestId: string, name: string): Promise<CheckedInGuest> {
    const response = await fetch(apiUrl(API_CONFIG.ENDPOINTS.CHECKINS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        guest_id: guestId, 
        name,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Guest already checked in');
      }
      throw new Error('Failed to check in guest');
    }

    return response.json();
  }

  async getCheckedInGuests(): Promise<CheckedInGuest[]> {
    const response = await fetch(apiUrl(API_CONFIG.ENDPOINTS.CHECKINS));
    
    if (!response.ok) {
      throw new Error('Failed to fetch checked in guests');
    }

    return response.json();
  }
}

export const guestService = new GuestService();
