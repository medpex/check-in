
import { Link } from "react-router-dom";
import { Users, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckInScanner } from "@/components/scanner/CheckInScanner";
import { CheckOutScanner } from "@/components/scanner/CheckOutScanner";
import { LastScannedCard } from "@/components/scanner/LastScannedCard";
import { CheckedInGuestsList } from "@/components/scanner/CheckedInGuestsList";
import { useCheckedInGuests } from "@/hooks/useGuests";
import { useState } from "react";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin' | 'checkout';
}

const Index = () => {
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);
  const { data: checkedInGuests = [] } = useCheckedInGuests();

  const handleScanResult = (guest: ScannedGuest) => {
    setLastScanned(guest);
  };

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

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Check-In Scanner */}
          <CheckInScanner onScanResult={handleScanResult} />

          {/* Check-Out Scanner */}
          <CheckOutScanner onScanResult={handleScanResult} />

          {/* Status und Gästeliste */}
          <div className="space-y-6">
            {lastScanned && (
              <LastScannedCard lastScanned={lastScanned} />
            )}

            <CheckedInGuestsList guests={checkedInGuests} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
