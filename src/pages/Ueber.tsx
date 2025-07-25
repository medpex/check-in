
import { ArrowLeft, CheckCircle, QrCode, Users, Mail, Settings, Scan, UserPlus, Shield, Clock, BarChart3, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Ueber = () => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin">
          <Button variant="outline" size="icon" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Über das Check-In System</h1>
      </div>

      {/* Header Section */}
      <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl">
            Professionelles Event Check-In System
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-white/90 text-lg mb-6">
            Eine vollständige Lösung für die Verwaltung von Veranstaltungen mit modernster QR-Code-Technologie, 
            automatischer Gästeverwaltung und nahtlosem Check-In/Out-Prozess.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center min-w-[120px]">
                <div className="flex justify-center mb-2 text-white">
                  {stat.icon}
                </div>
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/25 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {feature.icon}
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Use Cases */}
      <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-xl">Perfekt geeignet für:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div key={index} className="bg-white/10 rounded-lg p-3 text-center">
                <span className="text-white font-medium">{useCase}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="backdrop-blur-sm bg-white/20 border-white/30 mb-8">
        <CardHeader>
          <CardTitle className="text-white text-xl">Ihre Vorteile auf einen Blick:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Für Veranstalter:</h3>
              <ul className="space-y-2">
                {[
                  "Vollständige Kontrolle über Gästeliste",
                  "Echtzeit-Übersicht über Anwesenheit",
                  "Automatisierte Einladungsprozesse",
                  "Professionelle QR-Code-Einladungen",
                  "Detaillierte Statistiken und Reports"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Für Gäste:</h3>
              <ul className="space-y-2">
                {[
                  "Kontaktloser Check-In per QR-Code",
                  "Schneller Ein- und Auscheck-Prozess",
                  "Digitale Einladungen per E-Mail",
                  "Einfache Selbstregistrierung",
                  "Mobile-optimierte Benutzeroberfläche"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Features */}
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">Technische Highlights:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Mobile First</h4>
              <p className="text-white/70 text-sm">Vollständig responsive Design für alle Geräte</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Konfigurierbar</h4>
              <p className="text-white/70 text-sm">Flexible SMTP-Konfiguration und Anpassungen</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Sicher</h4>
              <p className="text-white/70 text-sm">Geschützte Admin-Bereiche und sichere Datenübertragung</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ueber;
