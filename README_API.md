
# API Server Setup für Party Check-in App

## Umgebungsvariablen

Kopiere `.env.example` zu `.env` und trage deine API-URL ein:

```bash
cp .env.example .env
```

Dann bearbeite die `.env` Datei:
```
VITE_API_URL=http://localhost:3001/api
```

## Erforderliche API Endpunkte

Dein API-Server muss folgende Endpunkte bereitstellen:

### Gäste (Guests)

**GET `/api/guests`**
- Gibt alle Gäste zurück
- Response: `Guest[]`

**POST `/api/guests`**
- Erstellt einen neuen Gast
- Body: `{ "name": "string" }`
- Response: `Guest` (mit generiertem QR-Code)

**DELETE `/api/guests/:id`**
- Löscht einen Gast
- Response: Status 200

### Check-ins

**GET `/api/checkins`**
- Gibt alle eingecheckten Gäste zurück
- Response: `CheckedInGuest[]`

**POST `/api/checkins`**
- Checkt einen Gast ein
- Body: `{ "guest_id": "string", "name": "string", "timestamp": "ISO-string" }`
- Response: `CheckedInGuest`
- Error 409: Falls Gast bereits eingecheckt

**DELETE `/api/checkins/:guest_id`**
- Checkt einen Gast aus (entfernt ihn aus der Check-in Liste)
- Response: Status 200
- Error 404: Falls Gast nicht eingecheckt

## Datentypen

```typescript
interface Guest {
  id: string;
  name: string;
  qr_code: string; // Base64 Data-URL des QR-Codes
  created_at?: string;
}

interface CheckedInGuest {
  id: string;
  guest_id: string;
  name: string;
  timestamp: string;
}
```

## PostgreSQL Schema Beispiel

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  qr_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  UNIQUE(guest_id) -- Verhindert doppelte Check-ins
);
```

## QR-Code Format

Der QR-Code sollte folgende JSON-Struktur enthalten:
```json
{
  "id": "guest-uuid",
  "name": "Gast Name"
}
```
