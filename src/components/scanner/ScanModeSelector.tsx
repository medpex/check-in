
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScanMode = 'checkin' | 'checkout';

interface ScanModeSelectorProps {
  scanMode: ScanMode;
  setScanMode: (mode: ScanMode) => void;
  isScanning: boolean;
}

export const ScanModeSelector = ({ scanMode, setScanMode, isScanning }: ScanModeSelectorProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        onClick={() => setScanMode('checkin')}
        className={`flex-1 ${
          scanMode === 'checkin' 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-white/20 hover:bg-white/30'
        } text-white`}
        disabled={isScanning}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Check-in
      </Button>
      <Button
        onClick={() => setScanMode('checkout')}
        className={`flex-1 ${
          scanMode === 'checkout' 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-white/20 hover:bg-white/30'
        } text-white`}
        disabled={isScanning}
      >
        <X className="h-4 w-4 mr-2" />
        Check-out
      </Button>
    </div>
  );
};
