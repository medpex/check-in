import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeLimitPopupProps {
  isOpen: boolean;
  onClose?: () => void;
  isExpired?: boolean;
}

export const TimeLimitPopup = ({ isOpen, onClose, isExpired = false }: TimeLimitPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-red-50 border-red-200 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-red-800 text-xl font-bold">
            Zeitlimit abgelaufen
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-red-700 text-lg leading-relaxed">
            Der Nutzungszeitraum ist abgelaufen.
            <br />
            <span className="font-semibold">
              Wenden Sie sich an den Hersteller!
            </span>
          </p>
          
          <div className="pt-4">
            {onClose && !isExpired && (
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-white border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Schließen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 