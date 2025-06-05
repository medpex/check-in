
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useCheckedInGuests, useCheckInGuest, useCheckOutGuest } from "@/hooks/useGuests";
import { ScannerHeader } from "@/components/scanner/ScannerHeader";
import { ScanModeSelector } from "@/components/scanner/ScanModeSelector";
import { VideoScanner } from "@/components/scanner/VideoScanner";
import { LastScannedCard } from "@/components/scanner/LastScannedCard";
import { CheckedInGuestsList } from "@/components/scanner/CheckedInGuestsList";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin' | 'checkout';
}

type ScanMode = 'checkin' | 'checkout';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('checkin');

  const { data: scannedGuests = [], refetch } = useCheckedInGuests();
  const checkInMutation = useCheckInGuest();
  const checkOutMutation = useCheckOutGuest();

  const handleScanResult = (data: string) => {
    try {
      const guestData = JSON.parse(data);
      
      if (!guestData.id || !guestData.name) {
        toast.error("Ungültiger QR-Code");
        setIsProcessing(false);
        return;
      }

      const alreadyCheckedIn = scannedGuests.some(guest => guest.guest_id === guestData.id);

      if (scanMode === 'checkin') {
        if (alreadyCheckedIn) {
          toast.warning(`${guestData.name} ist bereits eingecheckt!`);
          setIsProcessing(false);
          return;
        }

        checkInMutation.mutate(
          { guestId: guestData.id, name: guestData.name },
          {
            onSuccess: (checkedInGuest) => {
              const scannedGuest: ScannedGuest = {
                id: checkedInGuest.id,
                name: checkedInGuest.name,
                timestamp: new Date(checkedInGuest.timestamp).toLocaleString('de-DE'),
                action: 'checkin'
              };
              setLastScanned(scannedGuest);
              refetch();
            },
            onError: (error) => {
              console.error('Fehler beim Check-in:', error);
            },
            onSettled: () => {
              setTimeout(() => {
                setIsProcessing(false);
              }, 1000);
            }
          }
        );
      } else {
        if (!alreadyCheckedIn) {
          toast.warning(`${guestData.name} ist nicht eingecheckt!`);
          setIsProcessing(false);
          return;
        }

        checkOutMutation.mutate(guestData.id, {
          onSuccess: () => {
            const scannedGuest: ScannedGuest = {
              id: guestData.id,
              name: guestData.name,
              timestamp: new Date().toLocaleString('de-DE'),
              action: 'checkout'
            };
            setLastScanned(scannedGuest);
            refetch();
          },
          onError: (error) => {
            console.error('Fehler beim Check-out:', error);
          },
          onSettled: () => {
            setTimeout(() => {
              setIsProcessing(false);
            }, 1000);
          }
        });
      }
      
    } catch (error) {
      console.error('Fehler beim Verarbeiten des QR-Codes:', error);
      toast.error("QR-Code konnte nicht verarbeitet werden");
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <ScannerHeader />

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="backdrop-blur-sm bg-white/20 border-white/30">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Kamera Scanner
                {isProcessing && (
                  <div className="text-sm text-yellow-300 mt-1">
                    Verarbeite QR-Code...
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScanModeSelector 
                scanMode={scanMode} 
                setScanMode={setScanMode} 
                isScanning={isScanning} 
              />
              
              <VideoScanner
                isScanning={isScanning}
                setIsScanning={setIsScanning}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                scanMode={scanMode}
                onScanResult={handleScanResult}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {lastScanned && (
              <LastScannedCard lastScanned={lastScanned} />
            )}

            <CheckedInGuestsList guests={scannedGuests} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
