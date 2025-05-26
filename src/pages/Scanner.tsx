
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import QrScanner from "qr-scanner";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
}

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedGuests, setScannedGuests] = useState<ScannedGuest[]>([]);
  const [lastScanned, setLastScanned] = useState<ScannedGuest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastScannedCodeRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

  useEffect(() => {
    // Lade bereits eingecheckte Gäste
    const checkedInGuests = JSON.parse(localStorage.getItem('checked-in-guests') || '[]');
    setScannedGuests(checkedInGuests);
  }, []);

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
      toast.success("Scanner gestartet");
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
    toast.info("Scanner gestoppt");
  };

  const handleScanResult = (data: string) => {
    // Verhindere mehrfache Verarbeitung des gleichen Codes
    const now = Date.now();
    const timeSinceLastScan = now - lastScannedTimeRef.current;
    
    // Ignoriere den gleichen Code wenn er innerhalb von 3 Sekunden gescannt wurde
    if (data === lastScannedCodeRef.current && timeSinceLastScan < 3000) {
      return;
    }

    // Verhindere gleichzeitige Verarbeitung
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
      const alreadyCheckedIn = scannedGuests.some(guest => guest.id === guestData.id);
      
      if (alreadyCheckedIn) {
        toast.warning(`${guestData.name} ist bereits eingecheckt!`);
        setIsProcessing(false);
        return;
      }

      const scannedGuest: ScannedGuest = {
        id: guestData.id,
        name: guestData.name,
        timestamp: new Date().toLocaleString('de-DE')
      };

      const updatedGuests = [...scannedGuests, scannedGuest];
      setScannedGuests(updatedGuests);
      setLastScanned(scannedGuest);
      
      // Speichere in localStorage
      localStorage.setItem('checked-in-guests', JSON.stringify(updatedGuests));
      
      toast.success(`${guestData.name} erfolgreich eingecheckt!`);
      
    } catch (error) {
      console.error('Fehler beim Verarbeiten des QR-Codes:', error);
      toast.error("QR-Code konnte nicht verarbeitet werden");
    } finally {
      // Setze Processing-Status nach kurzer Verzögerung zurück
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Camera className="h-8 w-8" />
            QR-Code Scanner
          </h1>
        </div>

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
              
              <div className="flex gap-4">
                {!isScanning ? (
                  <Button 
                    onClick={startScanning}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Scanner starten
                  </Button>
                ) : (
                  <Button 
                    onClick={stopScanning}
                    variant="destructive"
                    className="flex-1"
                  >
                    Scanner stoppen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {lastScanned && (
              <Card className="backdrop-blur-sm bg-green-500/20 border-green-400/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Zuletzt eingecheckt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-lg font-semibold">{lastScanned.name}</p>
                  <p className="text-white/70 text-sm">{lastScanned.timestamp}</p>
                </CardContent>
              </Card>
            )}

            <Card className="backdrop-blur-sm bg-white/20 border-white/30">
              <CardHeader>
                <CardTitle className="text-white">Eingecheckte Gäste ({scannedGuests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scannedGuests.length === 0 ? (
                    <p className="text-white/70 text-center py-8">
                      Noch keine Gäste eingecheckt
                    </p>
                  ) : (
                    scannedGuests.map((guest) => (
                      <div 
                        key={guest.id}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{guest.name}</p>
                          <p className="text-white/70 text-sm">{guest.timestamp}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
