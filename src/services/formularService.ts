
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
    const response = await fetch(apiUrl('/guests'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        email: request.privateEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async registerAdditionalGuest(request: AdditionalGuestRequest): Promise<GuestResponse> {
    const response = await fetch(apiUrl('/guests'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        email: request.email,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const formularService = new FormularService();
