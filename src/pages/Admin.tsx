
import { QrCode, Users, Mail, Settings, LogOut, User, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="sm:hidden"></div>
          <div className="text-center order-2 sm:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Admin-Bereich
            </h1>
            <p className="text-lg sm:text-xl text-white/80">
              Verwaltung des Check-in Systems
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 order-1 sm:order-2">
            <div className="text-right text-white">
              <p className="text-xs sm:text-sm">Angemeldet als</p>
              <p className="font-semibold text-sm sm:text-base">{user?.username}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-4"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Abmelden</span>
              <span className="sm:hidden">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-6 sm:mb-8">
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
