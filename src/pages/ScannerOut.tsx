
import { useState } from "react";
import { ArrowLeft, X, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckOutScanner } from "@/components/scanner/CheckOutScanner";
import { LastScannedCard } from "@/components/scanner/LastScannedCard";
import { useAuth } from "../contexts/AuthContext";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkout';
}

const ScannerOut = () => {
  const { user, logout } = useAuth();
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);

  const handleScanResult = (guest: ScannedGuest) => {
    setLastScanned(guest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-rose-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/scanner">
              <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <X className="h-8 w-8" />
              Check-Out Scanner
            </h1>
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

        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-6">
            <CheckOutScanner onScanResult={handleScanResult} />
            
            {lastScanned && (
              <LastScannedCard lastScanned={lastScanned} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerOut;
