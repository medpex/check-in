
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuestResponse } from "@/services/formularService";
import { useSendQRCodeEmail } from "@/hooks/useSMTP";

interface QRCodeDisplayProps {
  mainGuest: GuestResponse;
}

export const QRCodeDisplay = ({ mainGuest }: QRCodeDisplayProps) => {
  const sendQRCodeEmail = useSendQRCodeEmail();

  const handleSendQRCode = () => {
    if (mainGuest.email) {
      sendQRCodeEmail.mutate({ 
        guestId: mainGuest.id, 
        recipientEmail: mainGuest.email 
      });
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle className="text-white text-center">Ihr QR Code</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          {mainGuest?.qr_code ? (
            <img 
              src={mainGuest.qr_code} 
              alt="Ihr persönlicher QR Code"
              className="w-full max-w-[200px] mx-auto"
            />
          ) : (
            <div className="w-[200px] h-[200px] mx-auto bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">QR Code wird geladen...</span>
            </div>
          )}
        </div>
        <p className="text-white/80 text-sm">
          Name: {mainGuest?.name}
        </p>
        {mainGuest.email && (
          <Button 
            onClick={handleSendQRCode}
            disabled={sendQRCodeEmail.isPending}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sendQRCodeEmail.isPending ? "Wird gesendet..." : "QR Code per E-Mail senden"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
