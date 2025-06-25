import { useState } from "react";
import { ArrowLeft, Mail, QrCode, Users, UserPlus, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EmailVerificationForm {
  businessEmail: string;
}

interface GuestRegistrationForm {
  name: string;
  privateEmail: string;
}

interface AdditionalGuest {
  name: string;
  email: string;
}

const Formular = () => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedBusinessEmail, setVerifiedBusinessEmail] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [guestType, setGuestType] = useState<"family" | "friends" | null>(null);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");

  const emailForm = useForm<EmailVerificationForm>({
    defaultValues: {
      businessEmail: "",
    },
  });

  const registrationForm = useForm<GuestRegistrationForm>({
    defaultValues: {
      name: "",
      privateEmail: "",
    },
  });

  const onEmailVerification = async (data: EmailVerificationForm) => {
    try {
      console.log("Verifying business email:", data.businessEmail);
      
      // Simulate API call to verify business email against database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification - in real implementation, this would check against the database
      const isValidEmail = data.businessEmail.includes("@"); // Simple mock validation
      
      if (isValidEmail) {
        setVerifiedBusinessEmail(data.businessEmail);
        setEmailVerified(true);
        toast.success("Geschäftliche Email erfolgreich verifiziert!");
      } else {
        toast.error("Diese Email ist nicht in unserer Einladungsliste vorhanden.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Fehler bei der Email-Verifizierung");
    }
  };

  const onRegistrationSubmit = async (data: GuestRegistrationForm) => {
    try {
      console.log("Registering guest:", { ...data, businessEmail: verifiedBusinessEmail });
      
      // Simulate API call for guest registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock QR code (in real implementation, this would come from backend)
      const mockQrCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="50" y="50" width="100" height="100" fill="black"/>
          <text x="100" y="180" text-anchor="middle" font-family="Arial" font-size="12">QR Code für ${data.name}</text>
        </svg>
      `)}`;
      
      setQrCode(mockQrCode);
      setRegistrationComplete(true);
      toast.success("Registrierung erfolgreich!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Fehler bei der Registrierung");
    }
  };

  const addAdditionalGuest = () => {
    if (!newGuestName.trim() || !newGuestEmail.trim()) {
      toast.error("Bitte Name und Email eingeben");
      return;
    }

    const maxGuests = guestType === "family" ? 10 : 2;
    if (additionalGuests.length >= maxGuests) {
      toast.error(`Maximal ${maxGuests} ${guestType === "family" ? "Familienmitglieder" : "Freunde"} erlaubt`);
      return;
    }

    setAdditionalGuests([...additionalGuests, { name: newGuestName, email: newGuestEmail }]);
    setNewGuestName("");
    setNewGuestEmail("");
    toast.success(`${guestType === "family" ? "Familienmitglied" : "Freund"} hinzugefügt`);
  };

  const removeAdditionalGuest = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  const selectGuestType = (type: "family" | "friends") => {
    // Clear existing guests when switching type
    setAdditionalGuests([]);
    setNewGuestName("");
    setNewGuestEmail("");
    setGuestType(type);
  };

  // Email Verification Step
  if (!emailVerified) {
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
              Email Verifizierung
            </h1>
          </div>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Willkommen!</CardTitle>
              <p className="text-white/70 text-center text-sm">
                Bitte geben Sie Ihre geschäftliche Email-Adresse ein, um fortzufahren.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailVerification)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="businessEmail"
                    rules={{ 
                      required: "Geschäftliche Email ist erforderlich",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Ungültige Email-Adresse"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Geschäftliche Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ihre.geschaeft@unternehmen.com"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? "Verifiziere..." : "Email verifizieren"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Registration Form Step (after email verification)
  if (!registrationComplete) {
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
              <UserPlus className="h-8 w-8" />
              Gast Registrierung
            </h1>
          </div>

          {/* Email Verified Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white/80 text-sm">
              Email verifiziert: {verifiedBusinessEmail}
            </span>
          </div>

          <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Persönliche Daten</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...registrationForm}>
                <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-4">
                  <FormField
                    control={registrationForm.control}
                    name="name"
                    rules={{ required: "Name ist erforderlich" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ihr vollständiger Name"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registrationForm.control}
                    name="privateEmail"
                    rules={{ 
                      required: "Private Email ist erforderlich",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Ungültige Email-Adresse"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Private Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ihre.private@email.com"
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white"
                    disabled={registrationForm.formState.isSubmitting}
                  >
                    {registrationForm.formState.isSubmitting ? "Registriere..." : "Registrieren"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // QR Code and Additional Guests
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
            <QrCode className="h-8 w-8" />
            Registrierung Abgeschlossen
          </h1>
        </div>

        {/* QR Code Display */}
        <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Ihr QR Code</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={qrCode} 
                alt="Ihr persönlicher QR Code"
                className="w-full max-w-[200px] mx-auto"
              />
            </div>
            <Button 
              className="w-full bg-white/20 hover:bg-white/30 text-white"
              disabled
            >
              <Mail className="h-4 w-4 mr-2" />
              QR Code per Email senden (kommt bald)
            </Button>
          </CardContent>
        </Card>

        {/* Guest Type Selection */}
        {!guestType && (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Zusätzliche Gäste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-center text-sm">
                Möchten Sie weitere Personen anmelden? Wählen Sie eine Option:
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => selectGuestType("family")}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Familienmitglieder (bis zu 10)
                </Button>
                <Button 
                  onClick={() => selectGuestType("friends")}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Freunde (bis zu 2)
                </Button>
              </div>
              <p className="text-white/60 text-center text-xs">
                Sie können entweder Familienmitglieder ODER Freunde hinzufügen, nicht beides.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Guests Form */}
        {guestType && (
          <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {guestType === "family" ? "Familienmitglieder" : "Freunde"} hinzufügen
              </CardTitle>
              <p className="text-white/70 text-center text-sm">
                {additionalGuests.length} von {guestType === "family" ? "10" : "2"} hinzugefügt
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                <Button 
                  onClick={addAdditionalGuest}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                  disabled={additionalGuests.length >= (guestType === "family" ? 10 : 2)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {guestType === "family" ? "Familienmitglied" : "Freund"} hinzufügen
                </Button>
              </div>

              {/* Additional Guests List */}
              {additionalGuests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-white font-medium">
                    Hinzugefügte {guestType === "family" ? "Familienmitglieder" : "Freunde"}:
                  </h4>
                  {additionalGuests.map((guest, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/10 p-2 rounded">
                      <div className="text-white text-sm">
                        <div>{guest.name}</div>
                        <div className="text-white/70 text-xs">{guest.email}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeAdditionalGuest(index)}
                        className="bg-red-500/20 hover:bg-red-500/30"
                      >
                        Entfernen
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={() => setGuestType(null)}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Zurück zur Auswahl
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Formular;
