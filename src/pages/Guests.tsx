
import { ArrowLeft, Users, CheckCircle, XCircle, Download, Search, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useGuests, useCheckedInGuests } from "@/hooks/useGuests";
import { getEmailStats, sendAllInvitations } from "@/services/guestService";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  email?: string;
  qr_code: string;
  email_sent: boolean;
}

interface CheckedInGuest {
  id: string;
  name: string;
  timestamp: string;
}

const Guests = () => {
  const { data: allGuests = [], isLoading: isLoadingGuests, refetch: refetchGuests }: any = useGuests();
  const { data: checkedInGuests = [], isLoading: isLoadingCheckedIn }: any = useCheckedInGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [emailStats, setEmailStats] = useState({ totalEmails: 0, sentEmails: 0 });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchEmailStats = async () => {
      try {
        const stats = await getEmailStats();
        setEmailStats(stats);
      } catch (error) {
        console.error("Fehler beim Abrufen der E-Mail-Statistiken:", error);
        toast.error("Fehler beim Laden der E-Mail-Statistiken.");
      }
    };
    fetchEmailStats();
  }, [allGuests]);

  const handleSendAllInvitations = async () => {
    setIsSending(true);
    toast.info("Sende alle ausstehenden Einladungen...");
    try {
      const response = await sendAllInvitations();
      toast.success(response.message);
      refetchGuests(); // Gästeliste neu laden, um den E-Mail-Status zu aktualisieren
    } catch (error) {
      toast.error("Fehler beim Senden der Einladungen.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredGuests = useMemo(() => {
    if (!searchTerm || searchTerm.length < 3) {
      return allGuests;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return allGuests.filter(guest => 
      guest.name.toLowerCase().includes(searchLower) ||
      (guest.email && guest.email.toLowerCase().includes(searchLower))
    );
  }, [allGuests, searchTerm]);

  const isGuestCheckedIn = (guestId: string) => {
    return checkedInGuests.some(guest => guest.guest_id === guestId);
  };

  const getCheckInTime = (guestId: string) => {
    const checkedInGuest = checkedInGuests.find(guest => guest.guest_id === guestId);
    return checkedInGuest ? new Date(checkedInGuest.timestamp).toLocaleString('de-DE') : null;
  };

  const exportGuestList = () => {
    const data = filteredGuests.map(guest => ({
      name: guest.name,
      email: guest.email || '',
      status: isGuestCheckedIn(guest.id) ? 'Eingecheckt' : 'Nicht da',
      checkInTime: getCheckInTime(guest.id) || '-'
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Status,Check-in Zeit\n"
      + data.map(row => `${row.name},${row.email},${row.status},${row.checkInTime}`).join("\n");

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
  const filteredCheckedInCount = filteredGuests.filter(guest => isGuestCheckedIn(guest.id)).length;
  const filteredNotCheckedInCount = filteredGuests.length - filteredCheckedInCount;
  const pendingEmails = emailStats.totalEmails - emailStats.sentEmails;

  if (isLoadingGuests || isLoadingCheckedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardContent className="pt-6 text-center">
            <p className="text-white text-lg">Lade Gästedaten...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gästeliste
          </h1>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
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

          <Card className="backdrop-blur-sm bg-blue-500/20 border-blue-400/30 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">{emailStats.sentEmails} / {emailStats.totalEmails}</div>
              <div className="text-white/80">Einladungen versendet</div>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Alle Gäste</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-white/70 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Nach Name oder E-Mail suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 min-w-[300px]"
                />
              </div>
              {pendingEmails > 0 && (
                <Button
                  onClick={handleSendAllInvitations}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                  disabled={isSending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? `Sende (${pendingEmails})...` : `Alle ${pendingEmails} Einladungen senden`}
                </Button>
              )}
              <Button 
                onClick={exportGuestList}
                className="bg-white/20 hover:bg-white/30 text-white"
                size="sm"
                disabled={filteredGuests.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {searchTerm && searchTerm.length >= 3 && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <p className="text-white/70 text-sm">
                  {filteredGuests.length} von {totalCount} Gästen gefunden
                  {filteredGuests.length > 0 && (
                    <span className="ml-2">
                      ({filteredCheckedInCount} eingecheckt, {filteredNotCheckedInCount} nicht da)
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {filteredGuests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
                {searchTerm && searchTerm.length >= 3 ? (
                  <>
                    <p className="text-white/70 text-lg">Keine Gäste gefunden</p>
                    <p className="text-white/50">
                      Versuche einen anderen Suchbegriff
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white/70 text-lg">Keine Gäste gefunden</p>
                    <p className="text-white/50">
                      Gehe zu "Einladungen erstellen" um Gäste hinzuzufügen
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGuests.map((guest) => {
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
                          {guest.email && (
                            <div className="flex items-center gap-2">
                            <p className="text-white/60 text-sm">{guest.email}</p>
                              <Badge variant={guest.email_sent ? "default" : "secondary"}>
                                {guest.email_sent ? "Gesendet" : "Ausstehend"}
                              </Badge>
                            </div>
                          )}
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
