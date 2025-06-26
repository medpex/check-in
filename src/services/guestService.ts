import { apiUrl, API_CONFIG } from '@/config/api';

export interface Guest {
  id: string;
  name: string;
  email?: string;
  qr_code: string;
  main_guest_id?: string;
  guest_type?: 'family' | 'friends';
  created_at?: string;
  email_sent?: boolean;
  email_sent_at?: string;
}

export interface CheckedInGuest {
  id: string;
  guest_id: string;
  name: string;
  timestamp: string;
}

export interface GetGuestsParams {
  main_guest_id?: string;
  guest_type?: 'family' | 'friends';
}

class GuestService {
  async createGuest(name: string, email?: string, mainGuestId?: string, guestType?: 'family' | 'friends'): Promise<Guest> {
    const response = await fetch(apiUrl(API_CONFIG.ENDPOINTS.GUESTS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        email, 
        main_guest_id: mainGuestId,
        guest_type: guestType
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create guest');
    }

    return response.json();
  }

  async getAllGuests(params?: GetGuestsParams): Promise<Guest[]> {
    let url = apiUrl(API_CONFIG.ENDPOINTS.GUESTS);
    
    // Add query parameters if provided
    if (params && (params.main_guest_id || params.guest_type)) {
      const searchParams = new URLSearchParams();
      if (params.main_guest_id) {
        searchParams.append('main_guest_id', params.main_guest_id);
      }
      if (params.guest_type) {
        searchParams.append('guest_type', params.guest_type);
      }
      url += `?${searchParams.toString()}`;
    }
    
    const response = await fetch(url);
    
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

  async updateEmailStatus(guestId: string, emailSent: boolean): Promise<Guest> {
    const response = await fetch(apiUrl(`${API_CONFIG.ENDPOINTS.GUESTS}/${guestId}/email-status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email_sent: emailSent,
        email_sent_at: emailSent ? new Date().toISOString() : null
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update email status');
    }

    return response.json();
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

  async checkOutGuest(guestId: string): Promise<void> {
    const response = await fetch(apiUrl(`${API_CONFIG.ENDPOINTS.CHECKINS}/${guestId}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Guest not checked in');
      }
      throw new Error('Failed to check out guest');
    }
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
