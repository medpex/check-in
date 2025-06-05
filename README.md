
# 🎉 QR-Code Scanner Party App

Eine moderne Web-Anwendung zum Verwalten von Gästen und Check-ins bei Veranstaltungen mittels QR-Code-Scanner.

![Party App Banner](https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=200&fit=crop)

## ✨ Features

### 🎫 Gästeverwaltung
- **Gäste hinzufügen** - Neue Gäste mit automatischer QR-Code-Generierung
- **Einladungen erstellen** - QR-Codes für jeden Gast generieren
- **Gästeliste verwalten** - Übersicht aller eingeladenen Gäste

### 📱 QR-Code Scanner
- **Live-Scanner** - Echtzeitscanning über die Webcam
- **Check-in/Check-out** - Flexibles Ein- und Auschecken
- **Duplikatschutz** - Verhindert mehrfaches Scannen desselben Codes
- **Live-Feedback** - Sofortige Bestätigung nach erfolgreichem Scan

### 📊 Event-Dashboard
- **Eingecheckte Gäste** - Live-Übersicht aller anwesenden Gäste
- **Scan-Historie** - Letzte gescannte QR-Codes anzeigen
- **Responsive Design** - Funktioniert auf Desktop und Mobile

## 🚀 Schnellstart

### Voraussetzungen

- **Node.js** (Version 18 oder höher)
- **npm** oder **yarn**
- **Moderne Browser** mit Kamera-Zugriff

### Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/qr-scanner-party-app.git
cd qr-scanner-party-app

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter `http://localhost:5173` erreichbar.

### Backend Setup (Optional)

Für die volle Funktionalität benötigst du einen Backend-Server:

```bash
# Umgebungsvariablen konfigurieren
cp .env.example .env

# API-URL in .env anpassen
VITE_API_URL=http://localhost:3001/api
```

Siehe [API Setup Guide](README_API.md) für Backend-Konfiguration.

## 🏗️ Technologie Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type-safe Development
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Utility-first CSS Framework
- **shadcn/ui** - UI Component Library

### Scanner & QR-Codes
- **qr-scanner** - QR-Code Scanning Library
- **qrcode** - QR-Code Generation
- **Webcam API** - Browser Camera Access

### State Management & API
- **TanStack Query** - Server State Management
- **React Router** - Client-side Routing
- **Sonner** - Toast Notifications

## 📱 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/600x400/6366f1/ffffff?text=Dashboard+Screenshot)

### QR-Scanner
![Scanner](https://via.placeholder.com/600x400/10b981/ffffff?text=Scanner+Screenshot)

### Gästeverwaltung
![Guests](https://via.placeholder.com/600x400/f59e0b/ffffff?text=Guests+Screenshot)

## 🎯 Verwendung

### 1. Gäste hinzufügen
1. Gehe zur **Gäste**-Seite
2. Klicke auf **"Neuen Gast hinzufügen"**
3. Gib den Namen ein und speichere
4. QR-Code wird automatisch generiert

### 2. QR-Codes versenden
1. Gehe zur **Einladungen**-Seite
2. QR-Codes herunterladen oder teilen
3. Gäste können die Codes ausdrucken oder auf dem Handy zeigen

### 3. Check-in am Event
1. Öffne den **Scanner**
2. Wähle **Check-in Modus**
3. Scanne die QR-Codes der Gäste
4. Bestätigung wird automatisch angezeigt

### 4. Live-Übersicht
- **Dashboard** zeigt alle eingecheckten Gäste
- **Echtzeit-Updates** ohne Seitenneuerung
- **Scan-Historie** der letzten Aktivitäten

## 🛠️ Entwicklung

### Scripts

```bash
# Entwicklungsserver mit Hot Reload
npm run dev

# Production Build
npm run build

# Build Preview
npm run preview

# Linting
npm run lint

# Type Check
npm run type-check
```

### Projekt-Struktur

```
src/
├── components/          # Reusable UI Components
│   ├── ui/             # shadcn/ui Components
│   └── scanner/        # Scanner-specific Components
├── hooks/              # Custom React Hooks
├── pages/              # Page Components
├── services/           # API Services
├── config/             # Configuration
└── lib/                # Utilities
```

### Code-Qualität

- **TypeScript** für Type Safety
- **ESLint** für Code Quality
- **Prettier** für Code Formatting
- **Responsive Design** mit Tailwind CSS

## 🌐 Deployment

### Automatisches Deployment (Lovable)
1. Pushe Änderungen zum `main` Branch
2. Auto-Deploy ist standardmäßig aktiviert
3. App ist live unter deiner Lovable-URL

### Manuelles Deployment
```bash
# Build erstellen
npm run build

# Build-Ordner `dist/` auf Server hochladen
```

**Unterstützte Plattformen:**
- Vercel
- Netlify  
- GitHub Pages
- Jeder Static Hosting Service

## 🔧 Konfiguration

### API Integration

Die App unterstützt sowohl Mock-Daten als auch echte Backend-APIs:

```typescript
// .env Konfiguration
VITE_API_URL=http://localhost:3001/api
```

### Browser-Berechtigungen

Für den QR-Scanner werden folgende Berechtigungen benötigt:
- **Kamera-Zugriff** - Für QR-Code Scanning
- **HTTPS** - Required für Kamera-API (in Production)

## 🤝 Beitragen

Wir freuen uns über Beiträge! Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

### Development Workflow
1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'feat: add amazing feature'`)
4. Pushe zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

### Issue Templates
- 🐛 **Bug Report** - Melde Fehler
- ✨ **Feature Request** - Schlage neue Features vor
- 📝 **Documentation** - Verbessere die Dokumentation

## 🐛 Bekannte Probleme

### Browser-Kompatibilität
- **Safari iOS** - QR-Scanner benötigt iOS 14.3+
- **Chrome** - Kamera-Zugriff nur über HTTPS (außer localhost)
- **Firefox** - Vollständig unterstützt

### Performance
- **Große QR-Codes** können Scanning verlangsamen
- **Schwache Beleuchtung** beeinträchtigt Scan-Genauigkeit

## 📊 Roadmap

### Version 2.0
- [ ] **Offline-Modus** mit Service Workers
- [ ] **Bulk QR-Code Export** (PDF/ZIP)
- [ ] **Event-Templates** für wiederkehrende Veranstaltungen

### Version 2.1
- [ ] **Multi-Event Support** - Mehrere Events parallel
- [ ] **Gast-Kategorien** (VIP, Regular, Staff)
- [ ] **Statistiken & Analytics**

## 📄 Lizenz

Dieses Projekt ist unter der [MIT License](LICENSE) lizenziert.

## 👥 Team

Erstellt mit ❤️ von [Dein Name]

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com

## 🙏 Danksagungen

- [Lovable](https://lovable.dev) - AI-powered Development Platform
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [qr-scanner](https://github.com/nimiq/qr-scanner) - QR Scanning Library
- [Lucide](https://lucide.dev/) - Beautiful Icons

---

⭐ **Gefällt dir das Projekt?** Gib uns einen Stern auf GitHub!

[![GitHub stars](https://img.shields.io/github/stars/yourusername/qr-scanner-party-app.svg?style=social&label=Star)](https://github.com/yourusername/qr-scanner-party-app)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/qr-scanner-party-app.svg?style=social&label=Fork)](https://github.com/yourusername/qr-scanner-party-app/fork)
