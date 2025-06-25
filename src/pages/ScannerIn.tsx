
import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckInScanner } from "@/components/scanner/CheckInScanner";
import { LastScannedCard } from "@/components/scanner/LastScannedCard";
import { CheckedInGuestsList } from "@/components/scanner/CheckedInGuestsList";
import { useCheckedInGuests } from "@/hooks/useGuests";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin';
}

const ScannerIn = () => {
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);
  const { data: checkedInGuests = [] } = useCheckedInGuests();

  const handleScanResult = (guest: ScannedGuest) => {
    setLastScanned(guest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-600 to-emerald-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Check-In Scanner
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Check-In Scanner */}
          <CheckInScanner onScanResult={handleScanResult} />

          {/* Status und Gästeliste */}
          <div className="space-y-6">
            {lastScanned && (
              <LastScannedCard lastScanned={lastScanned} />
            )}

            <CheckedInGuestsList guests={checkedInGuests} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerIn;
