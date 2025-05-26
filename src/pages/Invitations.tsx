import { useState, useRef } from "react";
import { ArrowLeft, Download, QrCode, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import QRCodeLib from "qrcode";

interface Guest {
  id: string;
  name: string;
  qrCode: string;
}

const Invitations = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateGuestId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const generateQRCode = async (guestId: string, name: string) => {
    const data = JSON.stringify({ id: guestId, name });
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Fehler beim Erstellen des QR-Codes:', error);
      return '';
    }
  };

  const addGuest = async () => {
    if (!newGuestName.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    const guestId = generateGuestId();
    const qrCode = await generateQRCode(guestId, newGuestName);
    
    const newGuest: Guest = {
      id: guestId,
      name: newGuestName,
      qrCode
    };

    setGuests([...guests, newGuest]);
    setNewGuestName("");
    
    // Speichere in localStorage
    const existingGuests = JSON.parse(localStorage.getItem('party-guests') || '[]');
    existingGuests.push(newGuest);
    localStorage.setItem('party-guests', JSON.stringify(existingGuests));
    
    toast.success(`Einladung für ${newGuestName} erstellt!`);
  };

  const removeGuest = (guestId: string) => {
    const updatedGuests = guests.filter(guest => guest.id !== guestId);
    setGuests(updatedGuests);
    localStorage.setItem('party-guests', JSON.stringify(updatedGuests));
    toast.success("Gast entfernt");
  };

  const downloadQRCode = (guest: Guest) => {
    const link = document.createElement('a');
    link.download = `einladung-${guest.name}.png`;
    link.href = guest.qrCode;
    link.click();
  };

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
            <QrCode className="h-8 w-8" />
            Einladungen erstellen
          </h1>
        </div>

        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Neuen Gast hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Name des Gastes"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                onKeyPress={(e) => e.key === 'Enter' && addGuest()}
              />
              <Button onClick={addGuest} className="bg-white/20 hover:bg-white/30 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guests.map((guest) => (
            <Card key={guest.id} className="backdrop-blur-sm bg-white/20 border-white/30">
              <CardHeader className="text-center">
                <CardTitle className="text-white">{guest.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={guest.qrCode} 
                    alt={`QR Code für ${guest.name}`}
                    className="w-full max-w-[200px] mx-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => downloadQRCode(guest)}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    onClick={() => removeGuest(guest.id)}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500/20 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {guests.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 text-center py-12">
            <CardContent>
              <QrCode className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Noch keine Einladungen erstellt
              </p>
              <p className="text-white/50">
                Füge deinen ersten Gast hinzu um zu beginnen
              </p>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default Invitations;
