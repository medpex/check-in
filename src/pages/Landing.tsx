import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, Settings, Mail, Calendar } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            QR Scanner Party App
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Professionelle Check-in/Check-out Lösung für Ihre Veranstaltung
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 text-lg">
              Anmelden
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/70">
                Schnelles Ein- und Auschecken von Gästen mit QR-Code-Scanner
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-6 w-6" />
                Gästeverwaltung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/70">
                Verwalten Sie Ihre Gästeliste und Einladungen
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-6 w-6" />
                E-Mail Versand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/70">
                Automatischer Versand von Einladungen und QR-Codes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Check-in Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/70">
                Echtzeit-Überwachung der Anwesenheit Ihrer Gäste
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Benutzerverwaltung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/70">
                Rollenbasierte Zugriffe für Admin und Scanner
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <QrCode className="h-6 w-6" />
                Mobile Optimiert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/70">
                Responsive Design für alle Geräte und Bildschirmgrößen
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-white/60">
          <p>&copy; 2024 QR Scanner Party App. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing; 