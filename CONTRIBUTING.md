
# Beitrag zur QR-Code Scanner App

Diese Anleitung erklärt, wie du zur Entwicklung der QR-Code Scanner App beitragen kannst.

## Entwicklungsumgebung einrichten

### Voraussetzungen
- Node.js (Version 18 oder höher)
- npm oder yarn
- Git

### Repository klonen und einrichten

```bash
# Repository klonen
git clone <YOUR_REPO_URL>
cd <YOUR_PROJECT_NAME>

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Pull Request Workflow

### 1. Fork erstellen (für externe Beiträge)
1. Gehe zum Repository auf GitHub
2. Klicke auf "Fork" um eine Kopie in deinem Account zu erstellen
3. Klone dein Fork lokal

### 2. Feature Branch erstellen

```bash
# Aktuellen main Branch pullen
git checkout main
git pull origin main

# Neuen Feature Branch erstellen
git checkout -b feature/dein-feature-name
```

**Branch Naming Convention:**
- `feature/neue-funktion` - für neue Features
- `bugfix/fehler-behebung` - für Bugfixes
- `hotfix/kritischer-fehler` - für kritische Fixes
- `refactor/code-verbesserung` - für Code-Refactoring

### 3. Änderungen implementieren

```bash
# Änderungen implementieren und testen
npm run dev

# Code formatieren und linting prüfen
npm run lint
npm run format

# Build testen
npm run build
```

### 4. Commits erstellen

**Commit Message Convention:**
```
type(scope): kurze Beschreibung

Längere Beschreibung falls nötig

- Änderung 1
- Änderung 2
```

**Commit Types:**
- `feat`: Neue Funktionalität
- `fix`: Bugfix
- `refactor`: Code-Refactoring
- `style`: Styling-Änderungen
- `docs`: Dokumentation
- `test`: Tests hinzufügen/ändern
- `chore`: Build/Dependency Updates

**Beispiele:**
```bash
git add .
git commit -m "feat(scanner): QR-Code Duplikaterkennung hinzufügen"
git commit -m "fix(guests): Loading-Spinner Problem beheben"
git commit -m "refactor(components): VideoScanner in kleinere Komponenten aufteilen"
```

### 5. Pull Request erstellen

```bash
# Branch zu GitHub pushen
git push origin feature/dein-feature-name
```

1. Gehe zu GitHub und öffne dein Repository
2. Klicke auf "Compare & pull request"
3. Fülle die Pull Request Vorlage aus:

## Pull Request Vorlage

```markdown
## Beschreibung
Kurze Beschreibung der Änderungen

## Art der Änderung
- [ ] Bugfix (non-breaking change)
- [ ] Neue Funktionalität (non-breaking change)
- [ ] Breaking change (Änderung die bestehende Funktionalität beeinflusst)
- [ ] Dokumentation Update

## Getestet
- [ ] Lokale Tests erfolgreich
- [ ] Browser-Kompatibilität geprüft
- [ ] Mobile Ansicht getestet
- [ ] QR-Scanner Funktionalität getestet

## Screenshots (falls UI-Änderungen)
<!-- Screenshots hier einfügen -->

## Checklist
- [ ] Code folgt den Projekt-Standards
- [ ] Selbst-Review durchgeführt
- [ ] Keine Console-Errors
- [ ] Typescript-Errors behoben
```

## Code Review Prozess

### Als Reviewer:
1. **Funktionalität prüfen:** Macht der Code was er soll?
2. **Code-Qualität:** Ist der Code sauber und verständlich?
3. **Performance:** Keine offensichtlichen Performance-Probleme?
4. **UI/UX:** Sieht es gut aus und ist benutzerfreundlich?
5. **Tests:** Funktioniert alles wie erwartet?

### Review-Kommentare:
- **Blocking:** `🚫 Muss behoben werden`
- **Suggestion:** `💡 Vorschlag für Verbesserung`
- **Question:** `❓ Frage zum Code`
- **Praise:** `✅ Gut gemacht!`

## Nach dem Merge

```bash
# Zurück zum main branch
git checkout main

# Aktuellen Stand pullen
git pull origin main

# Feature branch löschen (lokal)
git branch -d feature/dein-feature-name

# Feature branch löschen (remote)
git push origin --delete feature/dein-feature-name
```

## Häufige Probleme

### Merge Conflicts
```bash
# Main branch in deinen feature branch mergen
git checkout feature/dein-feature-name
git pull origin main

# Konflikte lösen und committen
git add .
git commit -m "fix: merge conflicts resolved"
git push origin feature/dein-feature-name
```

### Commits nachträglich ändern
```bash
# Letzten commit ändern
git commit --amend -m "neue commit message"

# Mehrere commits zusammenfassen (interactive rebase)
git rebase -i HEAD~3
```

## Deployment

Die App wird automatisch deployed wenn:
- Commits in den `main` branch gemergt werden
- Lovable's Auto-Deploy aktiviert ist

## Hilfe und Support

- **Dokumentation:** [Lovable Docs](https://docs.lovable.dev/)
- **Issues:** Erstelle ein GitHub Issue für Bugs oder Feature Requests
- **Diskussionen:** Nutze GitHub Discussions für allgemeine Fragen

## Technologie Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **QR-Code:** qr-scanner library
- **State Management:** React Query (TanStack)
- **Build Tool:** Vite
- **Package Manager:** npm

---

Vielen Dank für deinen Beitrag! 🎉
