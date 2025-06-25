
import { apiUrl } from '@/config/api';

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
  // Mock email verification - in production würde hier gegen eine Datenbank geprüft
  async verifyBusinessEmail(request: EmailVerificationRequest): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation - in production würde hier eine echte Validierung stattfinden
    return request.businessEmail.includes('@') && request.businessEmail.length > 5;
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
