
import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QrScanner from "qr-scanner";
import { toast } from "sonner";
import { useCheckedInGuests, useCheckInGuest } from "@/hooks/useGuests";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin';
}

interface CheckInScannerProps {
  onScanResult: (guest: ScannedGuest) => void;
}

export const CheckInScanner = ({ onScanResult }: CheckInScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastScannedCodeRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

  const { data: checkedInGuests = [], refetch } = useCheckedInGuests();
  const checkInMutation = useCheckInGuest();

  const handleScanResult = (data: string) => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScannedTimeRef.current;
    
    if (data === lastScannedCodeRef.current && timeSinceLastScan < 3000) {
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    lastScannedCodeRef.current = data;
    lastScannedTimeRef.current = now;

    try {
      const guestData = JSON.parse(data);
      
      if (!guestData.id || !guestData.name) {
        toast.error("Ungültiger QR-Code");
        setIsProcessing(false);
        return;
      }

      // Prüfe ob Gast bereits eingecheckt ist
      const alreadyCheckedIn = checkedInGuests.some(guest => guest.guest_id === guestData.id);

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
            onScanResult(scannedGuest);
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
      
    } catch (error) {
      console.error('Fehler beim Verarbeiten des QR-Codes:', error);
      toast.error("QR-Code konnte nicht verarbeitet werden");
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
      toast.success("Check-In Scanner gestartet");
    } catch (error) {
      console.error('Fehler beim Starten des Scanners:', error);
      toast.error("Kamera konnte nicht gestartet werden");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
    setIsProcessing(false);
    lastScannedCodeRef.current = "";
    lastScannedTimeRef.current = 0;
    toast.info("Check-In Scanner gestoppt");
  };

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <Card className="backdrop-blur-sm bg-green-500/20 border-green-400/30">
      <CardHeader>
        <CardTitle className="text-white text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6" />
          Check-In Scanner
          {isProcessing && (
            <div className="text-sm text-yellow-300 ml-2">
              Verarbeite...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-black"
            style={{ aspectRatio: '4/3' }}
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <Camera className="h-16 w-16 text-white/50" />
            </div>
          )}
        </div>
        
        {!isScanning ? (
          <Button 
            onClick={startScanning}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Camera className="h-4 w-4 mr-2" />
            Check-In Scanner starten
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            variant="destructive"
            className="w-full"
          >
            Scanner stoppen
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
