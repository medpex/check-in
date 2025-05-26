import { useState, useEffect } from "react";
import { ArrowLeft, Users, CheckCircle, XCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Guest {
  id: string;
  name: string;
  qrCode: string;
}

interface CheckedInGuest {
  id: string;
  name: string;
  timestamp: string;
}

const Guests = () => {
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [checkedInGuests, setCheckedInGuests] = useState<CheckedInGuest[]>([]);

  useEffect(() => {
    // Lade alle Gäste und eingecheckte Gäste
    const guests = JSON.parse(localStorage.getItem('party-guests') || '[]');
    const checkedIn = JSON.parse(localStorage.getItem('checked-in-guests') || '[]');
    
    setAllGuests(guests);
    setCheckedInGuests(checkedIn);
  }, []);

  const isGuestCheckedIn = (guestId: string) => {
    return checkedInGuests.some(guest => guest.id === guestId);
  };

  const getCheckInTime = (guestId: string) => {
    const checkedInGuest = checkedInGuests.find(guest => guest.id === guestId);
    return checkedInGuest?.timestamp || null;
  };

  const exportGuestList = () => {
    const data = allGuests.map(guest => ({
      name: guest.name,
      status: isGuestCheckedIn(guest.id) ? 'Eingecheckt' : 'Nicht da',
      checkInTime: getCheckInTime(guest.id) || '-'
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Status,Check-in Zeit\n"
      + data.map(row => `${row.name},${row.status},${row.checkInTime}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gaesteliste.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const checkedInCount = checkedInGuests.length;
  const totalCount = allGuests.length;
  const notCheckedInCount = totalCount - checkedInCount;

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
            <Users className="h-8 w-8" />
            Gästeliste
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">{totalCount}</div>
              <div className="text-white/80">Gesamt Gäste</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-green-500/20 border-green-400/30 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">{checkedInCount}</div>
              <div className="text-white/80">Eingecheckt</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-red-500/20 border-red-400/30 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">{notCheckedInCount}</div>
              <div className="text-white/80">Nicht da</div>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Alle Gäste</CardTitle>
            <Button 
              onClick={exportGuestList}
              className="bg-white/20 hover:bg-white/30 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportieren
            </Button>
          </CardHeader>
          <CardContent>
            {allGuests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">Keine Gäste gefunden</p>
                <p className="text-white/50">
                  Gehe zu "Einladungen erstellen" um Gäste hinzuzufügen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allGuests.map((guest) => {
                  const isCheckedIn = isGuestCheckedIn(guest.id);
                  const checkInTime = getCheckInTime(guest.id);
                  
                  return (
                    <div 
                      key={guest.id}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {isCheckedIn ? (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-400" />
                        )}
                        <div>
                          <p className="text-white font-medium text-lg">{guest.name}</p>
                          {checkInTime && (
                            <p className="text-white/70 text-sm">
                              Eingecheckt: {checkInTime}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Badge 
                        variant={isCheckedIn ? "default" : "secondary"}
                        className={isCheckedIn 
                          ? "bg-green-500/20 text-green-100 border-green-400/30" 
                          : "bg-red-500/20 text-red-100 border-red-400/30"
                        }
                      >
                        {isCheckedIn ? "Eingecheckt" : "Nicht da"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Guests;
