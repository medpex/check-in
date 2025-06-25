
const pool = require('../config/database');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Datenbank mit Testdaten...');

    const testGuests = [
      { name: 'Max Mustermann', email: 'max@example.com' },
      { name: 'Anna Schmidt', email: 'anna@example.com' },
      { name: 'Tom Weber', email: 'tom@example.com' },
      { name: 'Lisa Müller', email: 'lisa@example.com' },
      { name: 'Frank Kaiser', email: 'frank@example.com' }
    ];

    for (const guest of testGuests) {
      const guestId = uuidv4();
      
      // QR-Code generieren
      const qrData = JSON.stringify({
        id: guestId,
        name: guest.name
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Gast erstellen
      await pool.query(
        'INSERT INTO guests (id, name, email, qr_code) VALUES ($1, $2, $3, $4)',
        [guestId, guest.name, guest.email, qrCodeDataUrl]
      );

      console.log(`✅ Testgast erstellt: ${guest.name}`);
    }

    console.log('🎉 Seeding abgeschlossen! Testgäste wurden erstellt.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler beim Seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
