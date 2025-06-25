
import { useState } from "react";
import { ArrowLeft, Download, QrCode, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuests, useCreateGuest, useDeleteGuest } from "@/hooks/useGuests";
import { toast } from "sonner";

const Invitations = () => {
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const { data: guests = [], isLoading, error } = useGuests();
  const createGuestMutation = useCreateGuest();
  const deleteGuestMutation = useDeleteGuest();

  const addGuest = async () => {
    if (!newGuestName.trim() || !newGuestEmail.trim()) {
      return;
    }

    createGuestMutation.mutate({ name: newGuestName, email: newGuestEmail }, {
      onSuccess: () => {
        setNewGuestName("");
        setNewGuestEmail("");
      }
    });
  };

  const removeGuest = (guestId: string) => {
    deleteGuestMutation.mutate(guestId);
  };

  const downloadQRCode = (guest: any) => {
    const link = document.createElement('a');
    link.download = `einladung-${guest.name}.png`;
    link.href = guest.qr_code;
    link.click();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-white text-lg mb-4">Verbindung zum Server fehlgeschlagen</p>
            <p className="text-white/70 text-sm">
              Stelle sicher, dass dein API-Server läuft und die VITE_API_URL korrekt konfiguriert ist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Name des Gastes"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={createGuestMutation.isPending}
                />
                <Input
                  placeholder="Email des Gastes"
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={createGuestMutation.isPending}
                />
              </div>
              <Button 
                onClick={addGuest} 
                className="bg-white/20 hover:bg-white/30 text-white w-full"
                disabled={createGuestMutation.isPending || !newGuestName.trim() || !newGuestEmail.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {createGuestMutation.isPending ? 'Erstelle...' : 'Hinzufügen'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 text-center py-12">
            <CardContent>
              <p className="text-white/70 text-lg">Lade Gäste...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guests.map((guest) => (
              <Card key={guest.id} className="backdrop-blur-sm bg-white/20 border-white/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{guest.name}</CardTitle>
                  {guest.email && (
                    <p className="text-white/70 text-sm">{guest.email}</p>
                  )}
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={guest.qr_code} 
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
                      disabled={deleteGuestMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && guests.length === 0 && (
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
      </div>
    </div>
  );
};

export default Invitations;
