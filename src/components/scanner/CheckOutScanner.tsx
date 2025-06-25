
import { useState, useRef, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QrScanner from "qr-scanner";
import { toast } from "sonner";
import { useCheckedInGuests, useCheckOutGuest } from "@/hooks/useGuests";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkout';
}

interface CheckOutScannerProps {
  onScanResult: (guest: ScannedGuest) => void;
}

export const CheckOutScanner = ({ onScanResult }: CheckOutScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastScannedCodeRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

  const { data: checkedInGuests = [], refetch } = useCheckedInGuests();
  const checkOutMutation = useCheckOutGuest();

  const handleScanResult = (data: string) => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScannedTimeRef.current;
    
    // Verhindere doppelte Scans desselben Codes innerhalb von 5 Sekunden
    if (data === lastScannedCodeRef.current && timeSinceLastScan < 5000) {
      return;
    }

    // Verhindere neue Scans während der Verarbeitung
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
        setTimeout(() => setIsProcessing(false), 2000);
        return;
      }

      // Prüfe ob Gast eingecheckt ist
      const isCheckedIn = checkedInGuests.some(guest => guest.guest_id === guestData.id);

      if (!isCheckedIn) {
        toast.warning(`${guestData.name} ist nicht eingecheckt!`);
        setTimeout(() => setIsProcessing(false), 2000);
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
          onScanResult(scannedGuest);
          refetch();
        },
        onError: (error) => {
          console.error('Fehler beim Check-out:', error);
        },
        onSettled: () => {
          setTimeout(() => {
            setIsProcessing(false);
          }, 2000);
        }
      });
      
    } catch (error) {
      console.error('Fehler beim Verarbeiten des QR-Codes:', error);
      toast.error("QR-Code konnte nicht verarbeitet werden");
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
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
      toast.success("Check-Out Scanner gestartet");
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
    toast.info("Check-Out Scanner gestoppt");
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
    <Card className="backdrop-blur-sm bg-red-500/20 border-red-400/30">
      <CardHeader>
        <CardTitle className="text-white text-center flex items-center justify-center gap-2">
          <X className="h-6 w-6" />
          Check-Out Scanner
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
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            disabled={isProcessing}
          >
            <Camera className="h-4 w-4 mr-2" />
            Check-Out Scanner starten
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
