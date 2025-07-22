const nodemailer = require('nodemailer');

async function sendInvitationEmail(guest, smtpConfig) {
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.username,
      pass: smtpConfig.password,
    },
  });

  const mailOptions = {
    from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
    to: guest.email,
    subject: 'Einladung zur Party - QR Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Du bist eingeladen! 🎉</h2>
        
        <p style="font-size: 16px; color: #555;">
          Hallo <strong>${guest.name}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #555;">
          du bist herzlich zu unserer Party eingeladen! Verwende den QR-Code unten für den Check-in vor Ort.
        </p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h3 style="color: #333; margin-bottom: 15px;">Dein persönlicher QR-Code:</h3>
          <img src="${guest.qr_code}" alt="QR Code für ${guest.name}"
          <p style="margin-top: 10px; font-size: 14px; color: #777;">
            Zeige diesen QR-Code beim Check-in vor
          </p>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1976d2; margin-top: 0;">Wichtige Informationen:</h4>
          <ul style="color: #555; margin: 10px 0; padding-left: 20px;">
            <li>Bringe diesen QR-Code auf deinem Handy mit</li>
            <li>Der QR-Code ist dein persönlicher Einlass</li>
            <li>Bei Fragen wende dich an das Event-Team</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
          Wir freuen uns auf dich! 🎊
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
        </p>
      </div>
    `,
    text: `
Hallo ${guest.name},

du bist herzlich zu unserer Party eingeladen!

Verwende den QR-Code in dieser E-Mail für den Check-in vor Ort.

Wichtige Informationen:
- Bringe diesen QR-Code auf deinem Handy mit
- Der QR-Code ist dein persönlicher Einlass
- Bei Fragen wende dich an das Event-Team

Wir freuen uns auf dich!

---
Diese E-Mail wurde automatisch generiert von der QR Scanner Party App.
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Einladungs-E-Mail erfolgreich versendet an: ${guest.email}`);
}

module.exports = {
  sendInvitationEmail,
}; 