import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Mail, Server, Loader2, Save, TestTube, ArrowLeft } from "lucide-react";

interface SMTPConfig {
  id?: number;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from_name: string;
  from_email: string;
}

const Settings: React.FC = () => {
  const { user, changePassword } = useAuth();
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    from_name: '',
    from_email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Passwort-Änderung
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // SMTP Config laden
  useEffect(() => {
    loadSMTPConfig();
  }, []);

  const loadSMTPConfig = async () => {
    try {
      const response = await fetch('/api/settings/smtp', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (response.ok) {
        const config = await response.json();
        if (config) {
          setSmtpConfig(config);
        }
      }
    } catch (error) {
      console.error('Error loading SMTP config:', error);
    }
  };

  const saveSMTPConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpConfig),
      });

      if (response.ok) {
        toast.success('SMTP-Konfiguration erfolgreich gespeichert!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Fehler beim Speichern der SMTP-Konfiguration');
      }
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast.error('Fehler beim Speichern der SMTP-Konfiguration');
    } finally {
      setIsLoading(false);
    }
  };

  const testSMTPConfig = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/settings/smtp/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpConfig),
      });

      if (response.ok) {
        toast.success('SMTP-Test erfolgreich! Test-E-Mail wurde gesendet.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'SMTP-Test fehlgeschlagen');
      }
    } catch (error) {
      console.error('Error testing SMTP config:', error);
      toast.error('SMTP-Test fehlgeschlagen');
    } finally {
      setIsTesting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Die neuen Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Das neue Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      // Error wird bereits im AuthContext behandelt
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header mit Zurück-Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">
              Einstellungen
            </h1>
            <p className="text-xl text-white/80">
              SMTP, Passwort und System-Einstellungen
            </p>
          </div>
        </div>

        {/* Benutzer-Informationen */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-6 w-6" />
              Benutzer-Informationen
            </CardTitle>
            <CardDescription className="text-white/70">
              Ihre Account-Details und Berechtigungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70 text-sm">Benutzername</Label>
                <p className="mt-1 text-white font-medium">{user?.username}</p>
              </div>
              <div>
                <Label className="text-white/70 text-sm">E-Mail</Label>
                <p className="mt-1 text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-white/70 text-sm">Rolle</Label>
                <p className="mt-1 text-white font-medium">{user?.role}</p>
              </div>
              <div>
                <Label className="text-white/70 text-sm">Registriert seit</Label>
                <p className="mt-1 text-white font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passwort ändern */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Passwort ändern
              </CardTitle>
              <Button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {showPasswordForm ? 'Abbrechen' : 'Passwort ändern'}
              </Button>
            </div>
            <CardDescription className="text-white/70">
              Ändern Sie Ihr Admin-Passwort für zusätzliche Sicherheit
            </CardDescription>
          </CardHeader>
          
          {showPasswordForm && (
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">
                    Aktuelles Passwort
                  </Label>
                  <Input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">
                    Neues Passwort
                  </Label>
                  <Input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Neues Passwort bestätigen
                  </Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Passwort ändern
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* SMTP Konfiguration */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-6 w-6" />
              SMTP Konfiguration
            </CardTitle>
            <CardDescription className="text-white/70">
              E-Mail-Server-Einstellungen für den Versand von Einladungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host" className="text-white">
                  SMTP Host
                </Label>
                <Input
                  type="text"
                  id="host"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port" className="text-white">
                  Port
                </Label>
                <Input
                  type="number"
                  id="port"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user" className="text-white">
                  Benutzername
                </Label>
                <Input
                  type="text"
                  id="user"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Passwort
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_name" className="text-white">
                  Absender Name
                </Label>
                <Input
                  type="text"
                  id="from_name"
                  value={smtpConfig.from_name}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_email" className="text-white">
                  Absender E-Mail
                </Label>
                <Input
                  type="email"
                  id="from_email"
                  value={smtpConfig.from_email}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="secure"
                    checked={smtpConfig.secure}
                    onCheckedChange={(checked) => setSmtpConfig({ ...smtpConfig, secure: checked as boolean })}
                    className="border-white/30 data-[state=checked]:bg-white/20 data-[state=checked]:border-white/50"
                  />
                  <Label htmlFor="secure" className="text-white">
                    SSL/TLS verwenden
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                onClick={saveSMTPConfig}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </>
                )}
              </Button>
              <Button
                onClick={testSMTPConfig}
                disabled={isTesting}
                className="bg-green-600/20 hover:bg-green-600/30 text-green-300 border-green-600/30"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testen...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    SMTP Testen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 