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
  Shield
} from "lucide-react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useChangeUserPassword } from '@/hooks/useUsers';
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

  const [showPassword, setShowPassword] = useState(false);

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

  // Benutzer-Management Funktionen
  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.password) {
      return;
    }

    await createUserMutation.mutateAsync({
      username: createForm.username,
      password: createForm.password,
      email: createForm.email || undefined,
      role: createForm.role
    });

    setIsCreateDialogOpen(false);
    setCreateForm({ username: '', password: '', email: '', role: 'scanner' });
  };

  const handleEditUser = async () => {
    if (!selectedUser || !editForm.username) {
      return;
    }

    await updateUserMutation.mutateAsync({
      userId: selectedUser.id,
      userData: {
        username: editForm.username,
        email: editForm.email || undefined,
        role: editForm.role,
        is_active: editForm.is_active
      }
    });

    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !passwordForm.password || passwordForm.password !== passwordForm.confirmPassword) {
      return;
    }

    await changePasswordMutation.mutateAsync({
      userId: selectedUser.id,
      passwordData: { password: passwordForm.password }
    });

    setIsPasswordDialogOpen(false);
    setPasswordForm({ password: '', confirmPassword: '' });
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    await deleteUserMutation.mutateAsync(selectedUser.id);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email || '',
      role: user.role,
      is_active: user.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setPasswordForm({ password: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="destructive" className="bg-red-500">
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

        {/* Benutzer-Management */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <UsersIcon className="h-6 w-6" />
                Benutzer-Verwaltung
              </CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Neuen Benutzer erstellen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
                    <DialogDescription>
                      Erstellen Sie einen neuen Benutzer mit entsprechenden Berechtigungen.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Benutzername *</Label>
                      <Input
                        id="username"
                        value={createForm.username}
                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                        placeholder="Benutzername eingeben"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Passwort *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          placeholder="Passwort eingeben"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="E-Mail eingeben (optional)"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Rolle</Label>
                      <Select value={createForm.role} onValueChange={(value: 'admin' | 'scanner') => setCreateForm({ ...createForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scanner">Scanner (Nur Check-in/out)</SelectItem>
                          <SelectItem value="admin">Admin (Vollzugriff)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleCreateUser}
                      disabled={!createForm.username || !createForm.password || createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? 'Erstelle...' : 'Erstellen'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="text-white/70">
              Verwalten Sie Benutzer und deren Berechtigungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                          {getRoleBadge(user.role)}
                          {!user.is_active && (
                            <Badge variant="outline" className="text-red-400 border-red-400">
                              Inaktiv
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                          {user.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {user.email}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Erstellt: {format(new Date(user.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Bearbeiten
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Benutzer bearbeiten</DialogTitle>
                            <DialogDescription>
                              Bearbeiten Sie die Benutzerdaten für {user.username}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-username">Benutzername *</Label>
                              <Input
                                id="edit-username"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-email">E-Mail</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-role">Rolle</Label>
                              <Select value={editForm.role} onValueChange={(value: 'admin' | 'scanner') => setEditForm({ ...editForm, role: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scanner">Scanner (Nur Check-in/out)</SelectItem>
                                  <SelectItem value="admin">Admin (Vollzugriff)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="edit-active"
                                checked={editForm.is_active}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                              />
                              <Label htmlFor="edit-active">Benutzer aktiv</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button 
                              onClick={handleEditUser}
                              disabled={!editForm.username || updateUserMutation.isPending}
                            >
                              {updateUserMutation.isPending ? 'Speichere...' : 'Speichern'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isPasswordDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPasswordDialog(user)}
                          >
                            <Lock className="w-4 h-4 mr-1" />
                            Passwort
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Passwort ändern</DialogTitle>
                            <DialogDescription>
                              Ändern Sie das Passwort für {user.username}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="new-password">Neues Passwort *</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showPassword ? "text" : "password"}
                                  value={passwordForm.password}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="confirm-password">Passwort bestätigen *</Label>
                              <Input
                                id="confirm-password"
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
                            <Button 
                              onClick={handleChangePassword}
                              disabled={!passwordForm.password || passwordForm.password !== passwordForm.confirmPassword || changePasswordMutation.isPending}
                            >
                              {changePasswordMutation.isPending ? 'Ändere...' : 'Ändern'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isDeleteDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Löschen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Benutzer löschen</DialogTitle>
                            <DialogDescription>
                              Sind Sie sicher, dass Sie den Benutzer "{user.username}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Abbrechen
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={handleDeleteUser}
                              disabled={deleteUserMutation.isPending}
                            >
                              {deleteUserMutation.isPending ? 'Lösche...' : 'Löschen'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
                {users?.length === 0 && (
                  <div className="text-center py-8">
                    <UsersIcon className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Keine Benutzer gefunden</h3>
                    <p className="text-white/70 mb-4">
                      Erstellen Sie den ersten Benutzer, um mit der Verwaltung zu beginnen.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ersten Benutzer erstellen
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
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