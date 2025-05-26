
import { Link } from "react-router-dom";
import { QrCode, Scan, Users, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="h-12 w-12 text-white" />
            <h1 className="text-5xl font-bold text-white">Party Check-in</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Erstelle individuelle QR-Code Einladungen und verwalte deine Gästeliste digital
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <QrCode className="h-12 w-12 text-white mx-auto mb-2" />
              <CardTitle className="text-white">Einladungen erstellen</CardTitle>
              <CardDescription className="text-white/80">
                Generiere personalisierte QR-Code Einladungen für deine Gäste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/invitations">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Einladungen erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <Scan className="h-12 w-12 text-white mx-auto mb-2" />
              <CardTitle className="text-white">QR-Codes scannen</CardTitle>
              <CardDescription className="text-white/80">
                Scanne die QR-Codes an der Einlasskontrolle mit deinem Handy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/scanner">
                <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Scanner öffnen
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
