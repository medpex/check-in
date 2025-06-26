
import { useState } from "react";
import { ArrowLeft, Mail, Send, TestTube, Save, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSMTPConfig, useSaveSMTPConfig, useTestSMTPConnection } from "@/hooks/useSMTP";
import { SMTPConfig } from "@/services/smtpService";
import { useForm } from "react-hook-form";

const SMTPConfigPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { data: smtpConfig, isLoading } = useSMTPConfig();
  const saveSMTPMutation = useSaveSMTPConfig();
  const testSMTPMutation = useTestSMTPConnection();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: {
      host: smtpConfig?.host || '',
      port: smtpConfig?.port || 587,
      secure: smtpConfig?.secure || false,
      user: smtpConfig?.user || '',
      password: smtpConfig?.password || '',
      from_name: smtpConfig?.from_name || '',
      from_email: smtpConfig?.from_email || '',
    }
  });

  // Reset form when data loads
  useState(() => {
    if (smtpConfig) {
      reset({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        user: smtpConfig.user,
        password: smtpConfig.password,
        from_name: smtpConfig.from_name,
        from_email: smtpConfig.from_email,
      });
    }
  });

  const watchedValues = watch();

  const onSave = (data: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>) => {
    saveSMTPMutation.mutate(data);
  };

  const onTest = () => {
    testSMTPMutation.mutate(watchedValues);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardContent className="pt-6 text-center">
            <p className="text-white text-lg">Lade SMTP-Konfiguration...</p>
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
            SMTP-Konfiguration
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/20 border-white/30">
            <CardHeader>
              <CardTitle className="text-white">E-Mail Server Einstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSave)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host" className="text-white">SMTP Server</Label>
                    <Input
                      id="host"
                      placeholder="smtp.gmail.com"
                      {...register("host", { required: "SMTP Server ist erforderlich" })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                    {errors.host && (
                      <p className="text-red-300 text-sm">{errors.host.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-white">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      placeholder="587"
                      {...register("port", { 
                        required: "Port ist erforderlich",
                        valueAsNumber: true,
                        min: { value: 1, message: "Port muss größer als 0 sein" },
                        max: { value: 65535, message: "Port muss kleiner als 65536 sein" }
                      })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                    {errors.port && (
                      <p className="text-red-300 text-sm">{errors.port.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="secure"
                    {...register("secure")}
                    className="data-[state=checked]:bg-white/30"
                  />
                  <Label htmlFor="secure" className="text-white">
                    Sichere Verbindung (SSL/TLS)
                  </Label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user" className="text-white">Benutzername/E-Mail</Label>
                    <Input
                      id="user"
                      placeholder="deine@email.com"
                      {...register("user", { required: "Benutzername ist erforderlich" })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                    {errors.user && (
                      <p className="text-red-300 text-sm">{errors.user.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Passwort</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password", { required: "Passwort ist erforderlich" })}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-white/70" />
                        ) : (
                          <Eye className="h-4 w-4 text-white/70" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-300 text-sm">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_name" className="text-white">Absender Name</Label>
                    <Input
                      id="from_name"
                      placeholder="Event Team"
                      {...register("from_name", { required: "Absender Name ist erforderlich" })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                    {errors.from_name && (
                      <p className="text-red-300 text-sm">{errors.from_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from_email" className="text-white">Absender E-Mail</Label>
                    <Input
                      id="from_email"
                      type="email"
                      placeholder="event@deine-domain.com"
                      {...register("from_email", { 
                        required: "Absender E-Mail ist erforderlich",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Ungültige E-Mail-Adresse"
                        }
                      })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                    {errors.from_email && (
                      <p className="text-red-300 text-sm">{errors.from_email.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={onTest}
                    disabled={testSMTPMutation.isPending}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testSMTPMutation.isPending ? 'Teste...' : 'Verbindung testen'}
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={saveSMTPMutation.isPending}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-white border-green-400/30"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveSMTPMutation.isPending ? 'Speichere...' : 'Speichern'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 mt-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Hinweise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-white/80 text-sm space-y-2">
                <p><strong>Gmail:</strong> Verwende ein App-Passwort anstelle deines normalen Passworts</p>
                <p><strong>Outlook:</strong> Host: smtp-mail.outlook.com, Port: 587, Secure: Ein</p>
                <p><strong>Yahoo:</strong> Host: smtp.mail.yahoo.com, Port: 587, Secure: Ein</p>
                <p><strong>Andere Provider:</strong> Konsultiere die Dokumentation deines E-Mail-Providers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SMTPConfigPage;
