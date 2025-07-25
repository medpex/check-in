import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Lock, 
  Mail, 
  Server, 
  Loader2, 
  Save, 
  TestTube, 
  ArrowLeft,
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  Palette,
  Upload
} from "lucide-react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useChangeUserPassword } from '@/hooks/useUsers';
import { useFormSettings, useSaveFormSettings } from '@/hooks/useFormSettings';
import { getTextColor, getInputBackgroundColor, getButtonBackgroundColor } from '@/lib/colorUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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

  // Benutzer-Management States
  const { data: users, isLoading: usersLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const changePasswordMutation = useChangeUserPassword();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'scanner' as 'admin' | 'scanner'
  });

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'scanner' as 'admin' | 'scanner',
    is_active: true
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });

  // Formular Customizer States
  const [backgroundColor, setBackgroundColor] = useState("#3B82F6");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Formular-Einstellungen laden
  const { data: formSettings } = useFormSettings();
  const saveFormSettingsMutation = useSaveFormSettings();

  // Einstellungen aus der Datenbank laden
  useEffect(() => {
    if (formSettings) {
      if (formSettings.background_color) setBackgroundColor(formSettings.background_color);
      if (formSettings.logo_url) {
        setLogoUrl(formSettings.logo_url);
        setLogoPreview(formSettings.logo_url);
      }
    }
  }, [formSettings]);

  // Speichern der Einstellungen
  const handleSaveFormSettings = async () => {
    saveFormSettingsMutation.mutate({
      background_color: backgroundColor,
      logo_url: logoUrl
    });
  };

  // Logo-Upload (base64 für Demo)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // SMTP Konfiguration laden
  useEffect(() => {
    loadSMTPConfig();
  }, []);

  const loadSMTPConfig = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings/smtp', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpConfig),
      });

      if (response.ok) {
        toast.success('SMTP-Konfiguration erfolgreich gespeichert');
      } else {
        toast.error('Fehler beim Speichern der SMTP-Konfiguration');
      }
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast.error('Fehler beim Speichern der SMTP-Konfiguration');
    } finally {
      setIsLoading(false);
    }
  };

  const testSMTPConfig = async () => {
    try {
      setIsTesting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings/smtp/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpConfig),
      });

      if (response.ok) {
        toast.success('SMTP-Test erfolgreich!');
      } else {
        toast.error('SMTP-Test fehlgeschlagen');
      }
    } catch (error) {
      console.error('Error testing SMTP config:', error);
      toast.error('Fehler beim SMTP-Test');
    } finally {
      setIsTesting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Das neue Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Passwort erfolgreich geändert');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      toast.error('Fehler beim Ändern des Passworts');
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.password || !createForm.email) {
      toast.error('Alle Felder sind erforderlich');
      return;
    }

    createUserMutation.mutate(createForm, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setCreateForm({ username: '', password: '', email: '', role: 'scanner' });
      }
    });
  };

  const handleEditUser = async () => {
    if (!editForm.username || !editForm.email) {
      toast.error('Benutzername und E-Mail sind erforderlich');
      return;
    }

    updateUserMutation.mutate({ id: selectedUser.id, ...editForm }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedUser(null);
      }
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    changePasswordMutation.mutate({
      userId: selectedUser.id,
      newPassword: passwordForm.password
    }, {
      onSuccess: () => {
        setIsPasswordDialogOpen(false);
        setPasswordForm({ password: '', confirmPassword: '' });
        setSelectedUser(null);
      }
    });
  };

  const handleDeleteUser = async () => {
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    });
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="secondary" className="bg-red-500">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-500">
        <UsersIcon className="w-3 h-3 mr-1" />
        Scanner
      </Badge>
    );
  };

  // Hilfsfunktion für Textfarbe


  // Logo-Upload Handler
  // const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => setLogoPreview(reader.result as string);
  //     reader.readAsDataURL(file);
  //     // Hier könntest du das File an dein Backend schicken und die URL speichern
  //     // setLogoUrl(uploadedUrl)
  //   }
  // };

  const previewTextColor = getTextColor(backgroundColor);
  const inputBackgroundColor = getInputBackgroundColor(backgroundColor);
  const buttonBackgroundColor = getButtonBackgroundColor(backgroundColor);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header mit Zurück-Button */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Einstellungen
            </h1>
            <p className="text-lg sm:text-xl text-white/80">
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
                <Button type="submit" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Passwort ändern
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Benutzer-Verwaltung */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <UsersIcon className="h-6 w-6" />
                Benutzer-Verwaltung
              </CardTitle>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Neuen Benutzer erstellen
              </Button>
            </div>
            <CardDescription className="text-white/70">
              Verwalten Sie Benutzer und deren Berechtigungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : (
              <div className="space-y-4">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-white/70 text-sm">{user.email}</p>
                        <p className="text-white/50 text-xs">
                          Erstellt: {format(new Date(user.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openEditDialog(user)}
                        variant="outline"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => openPasswordDialog(user)}
                        variant="outline"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => openDeleteDialog(user)}
                        variant="outline"
                        size="sm"
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMTP Konfiguration */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="h-6 w-6" />
              SMTP Konfiguration
            </CardTitle>
            <CardDescription className="text-white/70">
              E-Mail-Server-Einstellungen für den Versand von Einladungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
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
                  Benutzername (optional)
                </Label>
                <Input
                  type="text"
                  id="user"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                  placeholder="Leer lassen für SMTP ohne Authentifizierung"
                />
                <p className="text-white/50 text-xs">Leer lassen für SMTP ohne Authentifizierung</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Passwort (optional)
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50"
                  placeholder="Leer lassen für SMTP ohne Authentifizierung"
                />
                <p className="text-white/50 text-xs">Leer lassen für SMTP ohne Authentifizierung</p>
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

        {/* Formular Customizer */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="h-6 w-6" />
              Formular Customizer
            </CardTitle>
            <CardDescription className="text-white/70">
              Passe das Aussehen des Registrierungsformulars an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hintergrundfarbe */}
            <div className="space-y-2">
              <Label htmlFor="backgroundColor" className="text-white">
                Hintergrundfarbe
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                  className="w-20 h-10 p-1 border-white/30 bg-white/10"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={e => setBackgroundColor(e.target.value)}
                  maxLength={7}
                  style={{ width: 90 }}
                />
              </div>
            </div>

            {/* Logo-Upload */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-white">
                Logo URL
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="logoUrl"
                  type="url"
                  value={logoUrl || ''}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoPreview(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Upload className="h-4 w-4 mr-2" />
                  Hochladen
                </Button>
              </div>
            </div>

            {/* Vorschau */}
            <div className="space-y-2">
              <Label className="text-white">Vorschau</Label>
              <div 
                className="p-6 rounded-lg border-2 border-dashed border-white/30"
                style={{ 
                  backgroundColor: backgroundColor,
                  color: previewTextColor 
                }}
              >
                <div className="text-center space-y-4">
                  {logoPreview && (
                    <div className="flex justify-center">
                      <img 
                        src={logoPreview} 
                        alt="Logo Vorschau" 
                        className="h-16 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold">Willkommen!</h3>
                  <p className="text-sm opacity-80">
                    Bitte geben Sie Ihre geschäftliche Email-Adresse ein, um fortzufahren.
                  </p>
                  <div 
                    className="rounded p-3 border"
                    style={{ 
                      backgroundColor: inputBackgroundColor,
                      borderColor: previewTextColor + '30' // 30% Transparenz
                    }}
                  >
                    <input 
                      type="email" 
                      placeholder="ihre.geschaeft@unternehmen.com"
                      className="w-full bg-transparent border-none outline-none"
                      style={{ 
                        color: previewTextColor,
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                  <button 
                    className="px-6 py-2 rounded transition-colors border"
                    style={{ 
                      color: previewTextColor,
                      backgroundColor: buttonBackgroundColor,
                      borderColor: previewTextColor + '30' // 30% Transparenz
                    }}
                  >
                    Email verifizieren
                  </button>
                </div>
              </div>
            </div>

            {/* Speichern Button */}
            <Button 
              onClick={handleSaveFormSettings}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Einstellungen speichern
            </Button>
          </CardContent>
        </Card>

        {/* Dialogs */}
        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="backdrop-blur-sm bg-white/95 border-white/30">
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Benutzer mit entsprechenden Berechtigungen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createUsername">Benutzername</Label>
                <Input
                  id="createUsername"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createEmail">E-Mail</Label>
                <Input
                  id="createEmail"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createPassword">Passwort</Label>
                <Input
                  id="createPassword"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createRole">Rolle</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: value as 'admin' | 'scanner' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scanner">Scanner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Erstelle...' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="backdrop-blur-sm bg-white/95 border-white/30">
            <DialogHeader>
              <DialogTitle>Benutzer bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die Benutzerdaten und Berechtigungen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editUsername">Benutzername</Label>
                <Input
                  id="editUsername"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">E-Mail</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Rolle</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value as 'admin' | 'scanner' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scanner">Scanner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="editActive"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                />
                <Label htmlFor="editActive">Aktiv</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Speichere...' : 'Speichern'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="backdrop-blur-sm bg-white/95 border-white/30">
            <DialogHeader>
              <DialogTitle>Passwort ändern</DialogTitle>
              <DialogDescription>
                Ändern Sie das Passwort für {selectedUser?.username}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newUserPassword">Neues Passwort</Label>
                <Input
                  id="newUserPassword"
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmUserPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmUserPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? 'Ändere...' : 'Ändern'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="backdrop-blur-sm bg-white/95 border-white/30">
            <DialogHeader>
              <DialogTitle>Benutzer löschen</DialogTitle>
              <DialogDescription>
                Sind Sie sicher, dass Sie {selectedUser?.username} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleDeleteUser} 
                disabled={deleteUserMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteUserMutation.isPending ? 'Lösche...' : 'Löschen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Settings;