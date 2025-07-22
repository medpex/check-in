import { ScanLine, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";

const Scanner = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header mit Benutzer-Info und Logout */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
            Scanner Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-white/80">
            Check-in/Check-out für die Veranstaltung
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {/* Scanner Eingang */}
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

        {/* Scanner Ausgang */}
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
      </div>
    </div>
  );
};

export default Scanner; 