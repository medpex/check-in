
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Plus, Trash2, Building, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessEmails, useAddBusinessEmail, useDeleteBusinessEmail } from "@/hooks/useBusinessEmails";
import { testApiConnection } from "@/config/api";
import { toast } from "sonner";

const BusinessEmails = () => {
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [lastConnectionTest, setLastConnectionTest] = useState<number>(0);
  
  const { data: businessEmails = [], isLoading, error, refetch } = useBusinessEmails();
  const addEmailMutation = useAddBusinessEmail();
  const deleteEmailMutation = useDeleteBusinessEmail();

  useEffect(() => {
    // Teste Verbindung beim ersten Laden
    testConnection();
    
    // Teste Verbindung alle 30 Sekunden
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastConnectionTest > 30000) { // Mindestens 30 Sekunden zwischen Tests
        testConnection();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [lastConnectionTest]);

  const testConnection = async () => {
    if (isTestingConnection) return; // Verhindere mehrfache gleichzeitige Tests
    
    setIsTestingConnection(true);
    setLastConnectionTest(Date.now());
    
    try {
      const isConnected = await testApiConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      if (!isConnected) {
        console.log('🔴 API-Verbindung fehlgeschlagen');
      } else {
        console.log('🟢 API-Verbindung erfolgreich');
      }
    } catch (error) {
      console.error('🚨 Verbindungstest-Fehler:', error);
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

  const removeBusinessEmail = (id: number) => {
    deleteEmailMutation.mutate(id);
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
          <Link to="/">
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
                  disabled={addEmailMutation.isPending || connectionStatus === 'failed'}
                />
                <Input
                  placeholder="Firmenname (optional)"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={addEmailMutation.isPending || connectionStatus === 'failed'}
                />
              </div>
              <Button 
                onClick={addBusinessEmail} 
                className="bg-white/20 hover:bg-white/30 text-white w-full"
                disabled={addEmailMutation.isPending || !newEmail.trim() || connectionStatus === 'failed'}
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
                  <div className="flex justify-between items-center">
                    <p className="text-white/50 text-xs">
                      {new Date(businessEmail.created_at).toLocaleDateString('de-DE')}
                    </p>
                    <Button 
                      onClick={() => removeBusinessEmail(businessEmail.id)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-500/20 hover:bg-red-500/30"
                      disabled={deleteEmailMutation.isPending || connectionStatus === 'failed'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
