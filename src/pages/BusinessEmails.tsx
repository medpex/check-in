import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Plus, Trash2, Building, AlertCircle, RefreshCw, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessEmails, useAddBusinessEmail, useDeleteBusinessEmail } from "@/hooks/useBusinessEmails";
import { useSendBusinessInviteEmail } from "@/hooks/useSMTP";
import { testApiConnection } from "@/config/api";
import { toast } from "sonner";
import BusinessEmailCSVImport from "@/components/BusinessEmailCSVImport";

const BusinessEmails = () => {
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [lastConnectionTest, setLastConnectionTest] = useState<number>(0);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  const { data: businessEmails = [], isLoading, error, refetch } = useBusinessEmails();
  const addEmailMutation = useAddBusinessEmail();
  const deleteEmailMutation = useDeleteBusinessEmail();
  const sendBusinessInviteEmail = useSendBusinessInviteEmail();

  useEffect(() => {
    // Teste Verbindung beim ersten Laden
    testConnection();
  }, []);

  // Überwache Fehler beim Laden der Geschäftsemails
  useEffect(() => {
    if (error) {
      setConnectionStatus('failed');
    } else if (!isLoading && businessEmails.length >= 0 && connectionStatus !== 'failed') {
      setConnectionStatus('connected');
    }
  }, [error, isLoading, businessEmails.length]);

  const testConnection = async () => {
    if (isTestingConnection) return; // Verhindere mehrfache gleichzeitige Tests
    setIsTestingConnection(true);
    setLastConnectionTest(Date.now());
    try {
      const isConnected = await testApiConnection();
      if (!isConnected) {
        setConnectionStatus('failed');
        return;
      }
      // Teste zusätzlich, ob Geschäftsemails geladen werden können
      await refetch();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const addBusinessEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Bitte geben Sie eine Email-Adresse ein');
      return;
    }

    addEmailMutation.mutate({ 
      email: newEmail, 
      company: newCompany.trim() || undefined 
    }, {
      onSuccess: () => {
        setNewEmail("");
        setNewCompany("");
        toast.success('Geschäftsemail erfolgreich hinzugefügt');
      }
    });
  };

  const handleCSVImport = async (csvEmails: { email: string; company?: string }[]) => {
    setIsImportingCSV(true);
    setImportProgress({ current: 0, total: csvEmails.length });
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
      console.log(`📊 Starte CSV-Import für ${csvEmails.length} Geschäftsemails...`);
      
      for (let i = 0; i < csvEmails.length; i++) {
        const emailData = csvEmails[i];
        setImportProgress({ current: i + 1, total: csvEmails.length });
        
        try {
          console.log(`⏳ Erstelle Geschäftsemail ${i + 1}/${csvEmails.length}: ${emailData.email}`);
          
          await new Promise((resolve, reject) => {
            addEmailMutation.mutate(
              { email: emailData.email, company: emailData.company },
              {
                onSuccess: () => {
                  successCount++;
                  console.log(`✅ Geschäftsemail erfolgreich erstellt: ${emailData.email}`);
                  resolve(undefined);
                },
                onError: (error) => {
                  errorCount++;
                  console.error(`❌ Fehler beim Erstellen von ${emailData.email}:`, error);
                  reject(error);
                }
              }
            );
          });
          
          // 1 Sekunde Verzögerung zwischen den Requests
          if (i < csvEmails.length - 1) {
            console.log('⏸️ Warte 1 Sekunde vor nächster Email...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          console.error(`❌ Fehler beim Erstellen von Geschäftsemail ${emailData.email}:`, error);
          // Weiter mit der nächsten Email, auch wenn eine fehlschlägt
        }
      }
      
      // Erfolgsbenachrichtigung
      if (successCount > 0) {
        toast.success(`${successCount} von ${csvEmails.length} Geschäftsemails erfolgreich importiert!`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} Geschäftsemails konnten nicht importiert werden.`);
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

  const removeBusinessEmail = (id: number) => {
    deleteEmailMutation.mutate(id);
  };

  const handleSendInvite = (businessEmail: string) => {
    sendBusinessInviteEmail.mutate(businessEmail);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
            <div>
              <p className="text-white text-lg mb-2">Verbindung zum Server fehlgeschlagen</p>
              <p className="text-white/70 text-sm mb-4">
                Stelle sicher, dass dein API-Server läuft und erreichbar ist.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection}
                  className="bg-white/20 hover:bg-white/30 text-white w-full"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Teste Verbindung...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verbindung testen
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full"
                >
                  Erneut versuchen
                </Button>
              </div>
            </div>
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
            <Mail className="h-8 w-8" />
            Geschäftsemails verwalten
          </h1>
        </div>

        {/* Verbindungsstatus */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 
                  connectionStatus === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <span className="text-white text-sm">
                  {connectionStatus === 'connected' ? 'Server verbunden' : 
                   connectionStatus === 'failed' ? 'Server nicht erreichbar' : 'Verbindung wird getestet...'}
                </span>
              </div>
              <Button 
                onClick={testConnection} 
                disabled={isTestingConnection}
                size="sm"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isTestingConnection ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <BusinessEmailCSVImport 
          onImport={handleCSVImport} 
          isImporting={isImportingCSV || addEmailMutation.isPending}
        />

        {isImportingCSV && (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <p className="mb-2">Importiere CSV-Daten...</p>
                <p className="text-sm text-white/70">
                  Email {importProgress.current} von {importProgress.total}
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

        {/* Neue Email hinzufügen */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Neue berechtigte Geschäftsemail hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="geschaeft@unternehmen.com"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={addEmailMutation.isPending || connectionStatus === 'failed' || isImportingCSV}
                />
                <Input
                  placeholder="Firmenname (optional)"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={addEmailMutation.isPending || connectionStatus === 'failed' || isImportingCSV}
                />
              </div>
              <Button 
                onClick={addBusinessEmail} 
                className="bg-white/20 hover:bg-white/30 text-white w-full"
                disabled={addEmailMutation.isPending || !newEmail.trim() || connectionStatus === 'failed' || isImportingCSV}
              >
                <Plus className="h-4 w-4 mr-2" />
                {addEmailMutation.isPending ? 'Hinzufügen...' : 'Hinzufügen'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Geschäftsemails anzeigen */}
        {isLoading ? (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 text-center py-12">
            <CardContent>
              <p className="text-white/70 text-lg">Lade Geschäftsemails...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessEmails.map((businessEmail) => (
              <Card key={businessEmail.id} className="backdrop-blur-sm bg-white/20 border-white/30">
                <CardHeader>
                  <CardTitle className="text-white text-sm break-all">{businessEmail.email}</CardTitle>
                  {businessEmail.company && (
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {businessEmail.company}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-white/50 text-xs">
                      {new Date(businessEmail.created_at).toLocaleDateString('de-DE')}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleSendInvite(businessEmail.email)}
                        size="sm"
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-white"
                        disabled={sendBusinessInviteEmail.isPending || connectionStatus === 'failed' || isImportingCSV}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Einladen
                      </Button>
                      <Button 
                        onClick={() => removeBusinessEmail(businessEmail.id)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/20 hover:bg-red-500/30"
                        disabled={deleteEmailMutation.isPending || connectionStatus === 'failed' || isImportingCSV}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && businessEmails.length === 0 && connectionStatus === 'connected' && (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 text-center py-12">
            <CardContent>
              <Mail className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                Noch keine berechtigten Geschäftsemails
              </p>
              <p className="text-white/50">
                Füge die erste Geschäftsemail hinzu, damit sich Gäste registrieren können
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BusinessEmails;
