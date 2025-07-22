
import { QrCode, Users, Mail, Settings, Info, LogOut, User, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";

const Admin = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Admin-Bereich
            </h1>
            <p className="text-xl text-white/80">
              Verwaltung des Check-in Systems
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-white">
              <p className="text-sm">Angemeldet als</p>
              <p className="font-semibold">{user?.username}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
        {/* Über die App */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-6 w-6" />
              Über die App
            </CardTitle>
            <CardDescription className="text-white/70">
              Features und Beschreibung der App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/ueber">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
                Anzeigen
              </Button>
            </Link>
          </CardContent>
        </Card>

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

        {/* Einstellungen */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Einstellungen
            </CardTitle>
            <CardDescription className="text-white/70">
              SMTP, Passwort, Benutzer und System-Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/settings">
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
      </div>

      <div className="grid md:grid-cols-1 gap-6 max-w-6xl mx-auto">
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
