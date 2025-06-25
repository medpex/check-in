
import { apiUrl } from '@/config/api';

export interface BusinessEmail {
  id: number;
  email: string;
  company?: string;
  created_at: string;
}

export interface EmailVerificationResponse {
  verified: boolean;
  email?: string;
  company?: string;
}

class BusinessEmailService {
  async getAllBusinessEmails(): Promise<BusinessEmail[]> {
    const response = await fetch(apiUrl('/business-emails'));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async addBusinessEmail(email: string, company?: string): Promise<BusinessEmail> {
    const response = await fetch(apiUrl('/business-emails'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, company }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteBusinessEmail(id: number): Promise<void> {
    const response = await fetch(apiUrl(`/business-emails/${id}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async verifyBusinessEmail(email: string): Promise<EmailVerificationResponse> {
    const response = await fetch(apiUrl('/business-emails/verify'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const businessEmailService = new BusinessEmailService();
