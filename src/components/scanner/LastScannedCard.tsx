
import { CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScannedGuest {
  id: string;
  name: string;
  timestamp: string;
  action: 'checkin' | 'checkout';
}

interface LastScannedCardProps {
  lastScanned: ScannedGuest;
}

export const LastScannedCard = ({ lastScanned }: LastScannedCardProps) => {
  return (
    <Card className={`backdrop-blur-sm border-opacity-30 ${
      lastScanned.action === 'checkin' 
        ? 'bg-green-500/20 border-green-400/30' 
        : 'bg-red-500/20 border-red-400/30'
    }`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {lastScanned.action === 'checkin' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          {lastScanned.action === 'checkin' ? 'Zuletzt eingecheckt' : 'Zuletzt ausgecheckt'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white text-lg font-semibold">{lastScanned.name}</p>
        <p className="text-white/70 text-sm">{lastScanned.timestamp}</p>
      </CardContent>
    </Card>
  );
};
