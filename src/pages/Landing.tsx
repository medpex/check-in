import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, Mail, Settings, Calendar, CheckCircle, Scan, UserPlus, Shield, Clock, BarChart3, Smartphone } from "lucide-react";

const Landing: React.FC = () => {
  const features = [
    {
      icon: <QrCode className="h-8 w-8 text-blue-400" />,
      title: "QR-Code Einladungen",
      description: "Erstellen Sie personalisierte QR-Code Einladungen für jeden Gast mit automatischer E-Mail-Versendung.",
      benefits: ["Kontaktlose Einladungen", "Automatische Generierung", "Personalisierte Codes"]
    },
    {
      icon: <Scan className="h-8 w-8 text-green-400" />,
      title: "Check-In/Out Scanner",
      description: "Scannen Sie QR-Codes für schnelles Ein- und Auschecken der Gäste mit Echtzeit-Übersicht.",
      benefits: ["Blitzschneller Check-In", "Automatische Zeiterfassung", "Mobile Scanner-App"]
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: "Gästeverwaltung",
      description: "Vollständige Verwaltung aller Gäste mit Suchfunktion und detaillierter Übersicht.",
      benefits: ["Zentrale Gästeliste", "Suchfunktion", "Status-Übersicht"]
    },
    {
      icon: <Mail className="h-8 w-8 text-red-400" />,
      title: "E-Mail-System",
      description: "Integriertes SMTP-System für automatische E-Mail-Versendung der Einladungen.",
      benefits: ["SMTP-Konfiguration", "Automatischer Versand", "Geschäftsemails-Verwaltung"]
    },
    {
      icon: <UserPlus className="h-8 w-8 text-yellow-400" />,
      title: "Gastregistrierung",
      description: "Einfache Registrierung für neue Gäste mit E-Mail-Verifizierung.",
      benefits: ["Selbstregistrierung", "E-Mail-Verifizierung", "Benutzerfreundlich"]
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-400" />,
      title: "Sicherheit",
      description: "Sichere Geschäftsemails-Verwaltung und geschützte Admin-Bereiche.",
      benefits: ["Berechtigte E-Mail-Domains", "Sichere Konfiguration", "Admin-Schutz"]
    }
  ];

  const stats = [
    { label: "Blitzschneller Check-In", value: "< 2 Sek", icon: <Clock className="h-6 w-6" /> },
    { label: "Mobile Optimiert", value: "100%", icon: <Smartphone className="h-6 w-6" /> },
    { label: "Automatisierung", value: "95%", icon: <BarChart3 className="h-6 w-6" /> },
    { label: "Benutzerfreundlich", value: "⭐⭐⭐⭐⭐", icon: <CheckCircle className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            QR Scanner Party App
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-6 sm:mb-8 px-4">
            Professionelle Check-in/Check-out Lösung für Ihre Veranstaltung
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
              Anmelden
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center text-xl sm:text-2xl">
              Professionelles Event Check-In System
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/90 text-base sm:text-lg mb-4 sm:mb-6 px-2">
              Eine vollständige Lösung für die Verwaltung von Veranstaltungen mit modernster QR-Code-Technologie, 
              automatischer Gästeverwaltung und nahtlosem Check-In/Out-Prozess.
            </p>
            <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2 sm:gap-4 flex-wrap">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                  <div className="flex justify-center mb-1 sm:mb-2 text-white">
                    {stat.icon}
                  </div>
                  <div className="text-white font-bold text-sm sm:text-lg">{stat.value}</div>
                  <div className="text-white/70 text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
              <CardHeader>
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  {feature.icon}
                  <CardTitle className="text-white text-base sm:text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">{feature.description}</p>
                <ul className="space-y-1 sm:space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/70">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Use Cases */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Perfekt geeignet für:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {[
                "Corporate Events",
                "Konferenzen & Messen",
                "Hochzeiten & Feiern",
                "Workshops & Seminare",
                "Networking Events",
                "Produktpräsentationen",
                "Schulungsveranstaltungen",
                "VIP-Events"
              ].map((useCase, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                  <span className="text-white font-medium text-sm sm:text-base">{useCase}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Ihre Vorteile auf einen Blick:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-white font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Für Veranstalter:</h3>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    "Vollständige Kontrolle über Gästeliste",
                    "Echtzeit-Übersicht über Anwesenheit",
                    "Automatisierte Einladungsprozesse",
                    "Professionelle QR-Code-Einladungen",
                    "Detaillierte Statistiken und Reports"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Für Gäste:</h3>
                <ul className="space-y-1 sm:space-y-2">
                  {[
                    "Kontaktloser Check-In per QR-Code",
                    "Schneller Ein- und Auscheck-Prozess",
                    "Digitale Einladungen per E-Mail",
                    "Einfache Selbstregistrierung",
                    "Mobile-optimierte Benutzeroberfläche"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Features */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Technische Highlights:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="bg-white/10 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Mobile First</h4>
                <p className="text-white/70 text-xs sm:text-sm">Vollständig responsive Design für alle Geräte</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Konfigurierbar</h4>
                <p className="text-white/70 text-xs sm:text-sm">Flexible SMTP-Konfiguration und Anpassungen</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Sicher</h4>
                <p className="text-white/70 text-xs sm:text-sm">Geschützte Admin-Bereiche und sichere Datenübertragung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/60">
          <p>&copy; 2024 QR Scanner Party App. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing; 