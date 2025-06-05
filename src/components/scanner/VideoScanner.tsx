
import { useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import QrScanner from "qr-scanner";
import { toast } from "sonner";

type ScanMode = 'checkin' | 'checkout';

interface VideoScannerProps {
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  scanMode: ScanMode;
  onScanResult: (data: string) => void;
}

export const VideoScanner = ({ 
  isScanning, 
  setIsScanning, 
  isProcessing,
  setIsProcessing,
  scanMode, 
  onScanResult 
}: VideoScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastScannedCodeRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

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
    onScanResult(data);
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

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <>
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
            className={`flex-1 text-white ${
              scanMode === 'checkin' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <Camera className="h-4 w-4 mr-2" />
            {scanMode === 'checkin' ? 'Check-in Scanner starten' : 'Check-out Scanner starten'}
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
    </>
  );
};
