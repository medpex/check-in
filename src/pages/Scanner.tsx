
import { useState } from "react";
import { ScannerHeader } from "@/components/scanner/ScannerHeader";
import { LastScannedCard } from "@/components/scanner/LastScannedCard";
import { CheckedInGuestsList } from "@/components/scanner/CheckedInGuestsList";
import { CheckInScanner } from "@/components/scanner/CheckInScanner";
import { CheckOutScanner } from "@/components/scanner/CheckOutScanner";
import { useCheckedInGuests } from "@/hooks/useGuests";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin' | 'checkout';
}

const Scanner = () => {
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);
  const { data: checkedInGuests = [] } = useCheckedInGuests();

  const handleScanResult = (guest: ScannedGuest) => {
    setLastScanned(guest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <ScannerHeader />

        <div className="grid lg:grid-cols-3 gap-8">
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
      </div>
    </div>
  );
};

export default Scanner;
