
import { apiUrl } from '@/config/api';
import { businessEmailService } from './businessEmailService';

export interface EmailVerificationRequest {
  businessEmail: string;
}

export interface GuestRegistrationRequest {
  name: string;
  privateEmail: string;
  businessEmail: string;
}

export interface AdditionalGuestRequest {
  name: string;
  email: string;
  mainGuestId: string;
  guestType: 'family' | 'friends';
}

export interface GuestResponse {
  id: string;
  name: string;
  email: string;
  qr_code: string;
  main_guest_id?: string;
  guest_type?: 'family' | 'friends';
  created_at: string;
}

class FormularService {
  async verifyBusinessEmail(request: EmailVerificationRequest): Promise<boolean> {
    try {
      const result = await businessEmailService.verifyBusinessEmail(request.businessEmail);
      return result.verified;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async registerMainGuest(request: GuestRegistrationRequest): Promise<GuestResponse> {
    const response = await fetch(apiUrl('/guests/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        email: request.privateEmail,
        business_email: true, // Markiere als Business-Email für die Registrierung
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async registerAdditionalGuest(request: AdditionalGuestRequest): Promise<GuestResponse> {
    const response = await fetch(apiUrl('/guests/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        email: request.email,
        main_guest_id: request.mainGuestId,
        guest_type: request.guestType,
        business_email: false, // Zusätzliche Gäste sind keine Business-Emails
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAdditionalGuests(mainGuestId: string, guestType: 'family' | 'friends'): Promise<GuestResponse[]> {
    const params = new URLSearchParams({
      main_guest_id: mainGuestId,
      guest_type: guestType,
    });

    const response = await fetch(apiUrl(`/guests?${params.toString()}`));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // E-Mail-Funktionen für Familienmitglieder und Freunde
  async sendFamilyEmails(mainGuestId: string): Promise<any> {
    const response = await fetch(apiUrl('/guests/send-family-emails'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ main_guest_id: mainGuestId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async sendFriendEmails(mainGuestId: string): Promise<any> {
    const response = await fetch(apiUrl('/guests/send-friend-emails'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ main_guest_id: mainGuestId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async sendIndividualEmail(guestId: string): Promise<any> {
    const response = await fetch(apiUrl(`/guests/${guestId}/send-email`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const formularService = new FormularService();
