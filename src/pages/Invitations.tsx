
import { useState } from "react";
import { ArrowLeft, Download, QrCode, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuests, useCreateGuest, useDeleteGuest } from "@/hooks/useGuests";
import { toast } from "sonner";
import CSVImport from "@/components/CSVImport";

const Invitations = () => {
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
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

  const handleCSVImport = async (csvGuests: { name: string; email: string }[]) => {
    setIsImportingCSV(true);
    setImportProgress({ current: 0, total: csvGuests.length });
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
      console.log(`📊 Starte CSV-Import für ${csvGuests.length} Gäste...`);
      
      for (let i = 0; i < csvGuests.length; i++) {
        const guest = csvGuests[i];
        setImportProgress({ current: i + 1, total: csvGuests.length });
        
        try {
          console.log(`⏳ Erstelle Gast ${i + 1}/${csvGuests.length}: ${guest.name}`);
          
          await new Promise((resolve, reject) => {
            createGuestMutation.mutate(
              { name: guest.name, email: guest.email },
              {
                onSuccess: () => {
                  successCount++;
                  console.log(`✅ Gast erfolgreich erstellt: ${guest.name}`);
                  resolve(undefined);
                },
                onError: (error) => {
                  errorCount++;
                  console.error(`❌ Fehler beim Erstellen von ${guest.name}:`, error);
                  reject(error);
                }
              }
            );
          });
          
          // 1 Sekunde Verzögerung zwischen den Requests
          if (i < csvGuests.length - 1) {
            console.log('⏸️ Warte 1 Sekunde vor nächstem Gast...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          console.error(`❌ Fehler beim Erstellen von Gast ${guest.name}:`, error);
          // Weiter mit dem nächsten Gast, auch wenn einer fehlschlägt
        }
      }
      
      // Erfolgsbenachrichtigung
      if (successCount > 0) {
        toast.success(`${successCount} von ${csvGuests.length} Gästen erfolgreich importiert!`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} Gäste konnten nicht importiert werden.`);
      }
      
      console.log(`📈 CSV-Import abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`);
      
    } catch (error) {
      console.error('❌ Schwerwiegender Fehler beim CSV-Import:', error);
      toast.error('Fehler beim CSV-Import');
    } finally {
      setIsImportingCSV(false);
      setImportProgress({ current: 0, total: 0 });
    }
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

        <CSVImport 
          onImport={handleCSVImport} 
          isImporting={isImportingCSV || createGuestMutation.isPending}
        />

        {isImportingCSV && (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <p className="mb-2">Importiere CSV-Daten...</p>
                <p className="text-sm text-white/70">
                  Gast {importProgress.current} von {importProgress.total}
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  disabled={createGuestMutation.isPending || isImportingCSV}
                />
                <Input
                  placeholder="Email des Gastes"
                  type="email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={createGuestMutation.isPending || isImportingCSV}
                />
              </div>
              <Button 
                onClick={addGuest} 
                className="bg-white/20 hover:bg-white/30 text-white w-full"
                disabled={createGuestMutation.isPending || !newGuestName.trim() || !newGuestEmail.trim() || isImportingCSV}
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
                      disabled={isImportingCSV}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => removeGuest(guest.id)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/20 hover:bg-red-500/30"
                      disabled={deleteGuestMutation.isPending || isImportingCSV}
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
