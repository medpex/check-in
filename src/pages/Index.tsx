
import { Link } from "react-router-dom";
import { Users, PartyPopper, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="h-12 w-12 text-white" />
            <h1 className="text-5xl font-bold text-white">Party Check-in</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Scanne QR-Code Einladungen und verwalte deine Gästeliste digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="backdrop-blur-sm bg-green-500/20 border-green-400/30 hover:bg-green-500/30 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Check-In</CardTitle>
              <CardDescription className="text-white/80">
                Scanner für Gäste-Einlass
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/scanner-in">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Check-In öffnen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-red-500/20 border-red-400/30 hover:bg-red-500/30 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <X className="h-12 w-12 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Check-Out</CardTitle>
              <CardDescription className="text-white/80">
                Scanner für Gäste-Ausgang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/scanner-out">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Check-Out öffnen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Gästeliste</CardTitle>
              <CardDescription className="text-white/80">
                Übersicht über alle Gäste und deren Check-in Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/guests">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Gästeliste anzeigen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <PartyPopper className="h-12 w-12 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Einladungen</CardTitle>
              <CardDescription className="text-white/80">
                Neue Gäste einladen und QR-Codes erstellen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/invitations">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Einladungen verwalten
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-white/70 text-sm">
            Einfach • Schnell • Zuverlässig
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
