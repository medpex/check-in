
import { apiUrl } from '@/config/api';

export interface BusinessEmail {
  id: number;
  email: string;
  company?: string;
  created_at: string;
  email_sent?: boolean;
  email_sent_at?: string | null;
}

export interface EmailVerificationResponse {
  verified: boolean;
  email?: string;
  company?: string;
}

class BusinessEmailService {
  async getAllBusinessEmails(): Promise<BusinessEmail[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(apiUrl('/business-emails'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async addBusinessEmail(email: string, company?: string): Promise<BusinessEmail> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(apiUrl('/business-emails'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const token = localStorage.getItem('authToken');
    const response = await fetch(apiUrl(`/business-emails/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async verifyBusinessEmail(email: string): Promise<EmailVerificationResponse> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(apiUrl('/business-emails/verify'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
