
import { QrCode, UserPlus, Users, ScanLine, Building, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            QR Code Feier Check-in
          </h1>
          <p className="text-xl text-white/80">
            Digitale Gästeverwaltung für deine Veranstaltung
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Admin-Funktionen */}
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Geschäftsemails
              </CardTitle>
              <CardDescription className="text-white/70">
                Berechtigte Geschäftsemails verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/business-emails">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                  Verwalten
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Einladungen
              </CardTitle>
              <CardDescription className="text-white/70">
                QR-Codes für Gäste erstellen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/invitations">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                  Erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-6 w-6" />
                Gäste
              </CardTitle>
              <CardDescription className="text-white/70">
                Alle Gäste anzeigen und verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/guests">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                  Anzeigen
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Scanner-Funktionen */}
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ScanLine className="h-6 w-6" />
                Scanner Eingang
              </CardTitle>
              <CardDescription className="text-white/70">
                Gäste beim Eingang einchecken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/scanner-in">
                <Button className="w-full bg-green-600/60 hover:bg-green-600/70 text-white">
                  Check-In
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ScanLine className="h-6 w-6" />
                Scanner Ausgang
              </CardTitle>
              <CardDescription className="text-white/70">
                Gäste beim Ausgang auschecken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/scanner-out">
                <Button className="w-full bg-red-600/60 hover:bg-red-600/70 text-white">
                  Check-Out
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gast-Registrierung */}
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Gast-Registrierung
              </CardTitle>
              <CardDescription className="text-white/70">
                Für eingeladene Gäste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/formular">
                <Button className="w-full bg-blue-600/60 hover:bg-blue-600/70 text-white">
                  Registrieren
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-white/70">© Jakob Ejne 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
