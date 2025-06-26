
import { QrCode, Users, Mail, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Admin-Bereich
        </h1>
        <p className="text-xl text-white/80">
          Verwaltung des Check-in Systems
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {/* Geschäftsemails */}
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
            <Link to="/admin/business-emails">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                Verwalten
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* SMTP Konfiguration */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-6 w-6" />
              SMTP Config
            </CardTitle>
            <CardDescription className="text-white/70">
              E-Mail Server Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/smtp-config">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                Konfigurieren
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Einladungen */}
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
            <Link to="/admin/invitations">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                Erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Gäste */}
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
            <Link to="/admin/guests">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                Anzeigen
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
