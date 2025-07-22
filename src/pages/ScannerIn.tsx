
import { useState } from "react";
import { ArrowLeft, CheckCircle, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckInScanner } from "@/components/scanner/CheckInScanner";
import { LastScannedCard } from "@/components/scanner/LastScannedCard";
import { useAuth } from "../contexts/AuthContext";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin';
}

const ScannerIn = () => {
  const { user, logout } = useAuth();
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);

  const handleScanResult = (guest: ScannedGuest) => {
    setLastScanned(guest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-600 to-emerald-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/scanner">
              <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="hidden sm:inline">Check-In Scanner</span>
              <span className="sm:hidden">Check-In</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right text-white">
              <p className="text-xs sm:text-sm">Angemeldet als</p>
              <p className="font-semibold text-sm sm:text-base">{user?.username}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm px-2 sm:px-4"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Abmelden</span>
              <span className="sm:hidden">Logout</span>
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4 sm:space-y-6 px-2 sm:px-0">
            <CheckInScanner onScanResult={handleScanResult} />
            
            {lastScanned && (
              <LastScannedCard lastScanned={lastScanned} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerIn;
