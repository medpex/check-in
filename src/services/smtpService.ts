
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

export interface EmailResponse {
  success: boolean;
  message: string;
}

class SMTPService {
  async getSMTPConfig(): Promise<SMTPConfig | null> {
    try {
      console.log('🔗 Fetching SMTP config from:', apiUrl('/smtp/config'));
      const response = await fetch(apiUrl('/smtp/config'));
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('📧 No SMTP configuration found');
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ SMTP config loaded successfully');
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch SMTP configuration:', error);
      throw error;
    }
  }

  async saveSMTPConfig(config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SMTPConfig> {
    try {
      console.log('💾 Saving SMTP config to:', apiUrl('/smtp/config'));
      const response = await fetch(apiUrl('/smtp/config'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ SMTP config saved successfully');
      return data;
    } catch (error) {
      console.error('❌ Failed to save SMTP configuration:', error);
      throw error;
    }
  }

  async testSMTPConnection(config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>): Promise<EmailResponse> {
    try {
      console.log('🧪 Testing SMTP connection to:', apiUrl('/smtp/test'));
      const response = await fetch(apiUrl('/smtp/test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('🧪 SMTP test result:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to test SMTP connection:', error);
      return {
        success: false,
        message: `Verbindungstest fehlgeschlagen: ${error.message}`
      };
    }
  }

  async sendTestEmail(config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'> & { test_email: string }): Promise<EmailResponse> {
    try {
      console.log('📧 Sending test email to:', apiUrl('/smtp/send-test-email'));
      const response = await fetch(apiUrl('/smtp/send-test-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('📧 Test email result:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return {
        success: false,
        message: `Test-E-Mail-Versand fehlgeschlagen: ${error.message}`
      };
    }
  }

  async sendInvitationEmail(guestId: string, recipientEmail: string): Promise<EmailResponse> {
    try {
      console.log('📧 Sending invitation email to:', apiUrl('/smtp/send-invitation'));
      const response = await fetch(apiUrl('/smtp/send-invitation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestId, recipientEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('📧 Invitation email result:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to send invitation email:', error);
      return {
        success: false,
        message: `Einladungs-E-Mail-Versand fehlgeschlagen: ${error.message}`
      };
    }
  }
}

export const smtpService = new SMTPService();
