
import { apiUrl } from '@/config/api';

export interface SMTPConfig {
  id?: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from_name: string;
  from_email: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class SMTPService {
  async getSMTPConfig(): Promise<SMTPConfig | null> {
    const response = await fetch(apiUrl('/smtp/config'));
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch SMTP configuration');
    }
    return response.json();
  }

  async saveSMTPConfig(config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SMTPConfig> {
    const response = await fetch(apiUrl('/smtp/config'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to save SMTP configuration');
    }

    return response.json();
  }

  async testSMTPConnection(config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string }> {
    const response = await fetch(apiUrl('/smtp/test'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to test SMTP connection');
    }

    return response.json();
  }

  async sendInvitationEmail(guestId: string, recipientEmail: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(apiUrl('/smtp/send-invitation'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guestId, recipientEmail }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invitation email');
    }

    return response.json();
  }
}

export const smtpService = new SMTPService();
