const pool = require('../config/database');
const { getFormularUrl } = require('../config/app');

class EmailTemplateService {
  async getFormSettings() {
    try {
      const result = await pool.query('SELECT * FROM form_settings ORDER BY created_at DESC LIMIT 1');
      return result.rows[0] || { background_color: '#3B82F6', logo_url: null };
    } catch (error) {
      console.error('Error fetching form settings:', error);
      return { background_color: '#3B82F6', logo_url: null };
    }
  }

  async generateBusinessInvitationEmail(businessEmail) {
    const formSettings = await this.getFormSettings();
    
    return {
      subject: 'Einladung zur Party-Registrierung',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${formSettings.background_color}; color: ${this.getTextColor(formSettings.background_color)};">
          ${formSettings.logo_url ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${formSettings.logo_url}" alt="Logo" style="max-height: 80px; width: auto;" />
            </div>
          ` : ''}
          
          <h2 style="color: ${this.getTextColor(formSettings.background_color)}; text-align: center;">Sie sind eingeladen! 🎉</h2>
          
          <p style="font-size: 16px; color: ${this.getTextColor(formSettings.background_color)};">
            Hallo,
          </p>
          
          <p style="font-size: 16px; color: ${this.getTextColor(formSettings.background_color)};">
            Sie sind herzlich zu unserer Party eingeladen! Bitte registrieren Sie sich über den unten stehenden Link.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: ${this.getInputBackgroundColor(formSettings.background_color)}; border-radius: 10px; border: 1px solid ${this.getTextColor(formSettings.background_color)}30;">
            <h3 style="color: ${this.getTextColor(formSettings.background_color)}; margin-bottom: 15px;">Zur Registrierung:</h3>
            <a href="${getFormularUrl()}" 
               style="display: inline-block; background-color: ${this.getButtonBackgroundColor(formSettings.background_color)}; color: ${this.getTextColor(formSettings.background_color)}; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 1px solid ${this.getTextColor(formSettings.background_color)}30;">
              Jetzt registrieren
            </a>
          </div>
          
          <div style="background-color: ${this.getInputBackgroundColor(formSettings.background_color)}; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid ${this.getTextColor(formSettings.background_color)}30;">
            <h4 style="color: ${this.getTextColor(formSettings.background_color)}; margin-top: 0;">Wichtige Informationen:</h4>
            <ul style="color: ${this.getTextColor(formSettings.background_color)}; margin: 10px 0; padding-left: 20px;">
              <li>Verwenden Sie diese Geschäfts-E-Mail-Adresse für die Registrierung</li>
              <li>Nach der Registrierung erhalten Sie Ihren persönlichen QR-Code</li>
              <li>Bei Fragen wende Sie sich an das Event-Team</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: ${this.getTextColor(formSettings.background_color)}; text-align: center; margin-top: 30px;">
            Wir freuen uns auf Sie! 🎊
          </p>
          
          <hr style="border: none; border-top: 1px solid ${this.getTextColor(formSettings.background_color)}30; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: ${this.getTextColor(formSettings.background_color)}80; text-align: center;">
            Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
          </p>
        </div>
      `,
      text: `
Hallo,

Sie sind herzlich zu unserer Party eingeladen!

Bitte registrieren Sie sich über diesen Link: ${getFormularUrl()}

Wichtige Informationen:
- Verwenden Sie diese Geschäfts-E-Mail-Adresse für die Registrierung
- Nach der Registrierung erhalten Sie Ihren persönlichen QR-Code
- Bei Fragen wende Sie sich an das Event-Team

Wir freuen uns auf Sie!

---
Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
      `
    };
  }

  async generateQRCodeEmail(guest, recipientEmail) {
    const formSettings = await this.getFormSettings();
    
    return {
      subject: `QR Code für ${guest.name} - Party Check-in`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${formSettings.background_color}; color: ${this.getTextColor(formSettings.background_color)};">
          ${formSettings.logo_url ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${formSettings.logo_url}" alt="Logo" style="max-height: 80px; width: auto;" />
            </div>
          ` : ''}
          
          <h2 style="color: ${this.getTextColor(formSettings.background_color)}; text-align: center;">QR Code für die Party 🎉</h2>
          
          <p style="font-size: 16px; color: ${this.getTextColor(formSettings.background_color)};">
            Hallo,
          </p>
          
          <p style="font-size: 16px; color: ${this.getTextColor(formSettings.background_color)};">
            hier ist der QR-Code für <strong>${guest.name}</strong> für den Check-in bei unserer Party.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: ${this.getInputBackgroundColor(formSettings.background_color)}; border-radius: 10px; border: 1px solid ${this.getTextColor(formSettings.background_color)}30;">
            <h3 style="color: ${this.getTextColor(formSettings.background_color)}; margin-bottom: 15px;">QR-Code für ${guest.name}:</h3>
            <img src="${guest.qr_code}" alt="QR Code für ${guest.name}" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
            <p style="margin-top: 10px; font-size: 14px; color: ${this.getTextColor(formSettings.background_color)}80;">
              Zeige diesen QR-Code beim Check-in vor
            </p>
          </div>
          
          <div style="background-color: ${this.getInputBackgroundColor(formSettings.background_color)}; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid ${this.getTextColor(formSettings.background_color)}30;">
            <h4 style="color: ${this.getTextColor(formSettings.background_color)}; margin-top: 0;">Wichtige Informationen:</h4>
            <ul style="color: ${this.getTextColor(formSettings.background_color)}; margin: 10px 0; padding-left: 20px;">
              <li>Bringe diesen QR-Code auf dem Handy mit</li>
              <li>Der QR-Code ist der persönliche Einlass für ${guest.name}</li>
              <li>Bei Fragen wende dich an das Event-Team</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: ${this.getTextColor(formSettings.background_color)}; text-align: center; margin-top: 30px;">
            Wir freuen uns auf euch! 🎊
          </p>
          
          <hr style="border: none; border-top: 1px solid ${this.getTextColor(formSettings.background_color)}30; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: ${this.getTextColor(formSettings.background_color)}80; text-align: center;">
            Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
          </p>
        </div>
      `,
      text: `
Hallo,

hier ist der QR-Code für ${guest.name} für den Check-in bei unserer Party.

Wichtige Informationen:
- Bringe diesen QR-Code auf dem Handy mit
- Der QR-Code ist der persönliche Einlass für ${guest.name}
- Bei Fragen wende dich an das Event-Team

Wir freuen uns auf euch!

---
Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
      `
    };
  }

  // Hilfsfunktionen für Farbberechnung
  getTextColor(bgColor) {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  getInputBackgroundColor(bgColor) {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness > 128) {
      const darkerR = Math.max(0, r - 40);
      const darkerG = Math.max(0, g - 40);
      const darkerB = Math.max(0, b - 40);
      return `rgba(${darkerR}, ${darkerG}, ${darkerB}, 0.1)`;
    } else {
      const lighterR = Math.min(255, r + 40);
      const lighterG = Math.min(255, g + 40);
      const lighterB = Math.min(255, b + 40);
      return `rgba(${lighterR}, ${lighterG}, ${lighterB}, 0.2)`;
    }
  }

  getButtonBackgroundColor(bgColor) {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness > 128) {
      const darkerR = Math.max(0, r - 60);
      const darkerG = Math.max(0, g - 60);
      const darkerB = Math.max(0, b - 60);
      return `rgba(${darkerR}, ${darkerG}, ${darkerB}, 0.3)`;
    } else {
      const lighterR = Math.min(255, r + 60);
      const lighterG = Math.min(255, g + 60);
      const lighterB = Math.min(255, b + 60);
      return `rgba(${lighterR}, ${lighterG}, ${lighterB}, 0.3)`;
    }
  }
}

module.exports = new EmailTemplateService(); 