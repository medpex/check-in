
import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import { formularService, GuestResponse } from "@/services/formularService";
import { EmailVerificationForm } from "@/components/formular/EmailVerificationForm";
import { GuestRegistrationForm } from "@/components/formular/GuestRegistrationForm";
import { QRCodeDisplay } from "@/components/formular/QRCodeDisplay";
import { GuestTypeSelection } from "@/components/formular/GuestTypeSelection";
import { TimeLimitPopup } from "@/components/ui/TimeLimitPopup";

interface GuestRegistrationFormData {
  name: string;
  privateEmail: string;
}

const Formular = () => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedBusinessEmail, setVerifiedBusinessEmail] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [mainGuest, setMainGuest] = useState<GuestResponse | null>(null);
  const [guestType, setGuestType] = useState<"family" | "friends" | null>(null);
  const [additionalGuests, setAdditionalGuests] = useState<GuestResponse[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingGuestTypes, setExistingGuestTypes] = useState<{
    hasFamily: boolean;
    hasFriends: boolean;
  }>({ hasFamily: false, hasFriends: false });
  const [showTimeLimitPopup, setShowTimeLimitPopup] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Prüfe vorhandene Gäste-Typen wenn mainGuest vorhanden ist
  useEffect(() => {
    if (mainGuest) {
      checkExistingGuestTypes();
    }
  }, [mainGuest]);

  // Lade zusätzliche Gäste wenn guestType gewählt wird
  useEffect(() => {
    if (mainGuest && guestType) {
      loadAdditionalGuests();
    }
  }, [mainGuest, guestType]);

  // Prüfe Zeitlimit beim Laden der Komponente und alle 30 Sekunden
  useEffect(() => {
    checkTimeLimit();
    
    const interval = setInterval(() => {
      checkTimeLimit();
    }, 30000); // Alle 30 Sekunden prüfen
    
    return () => clearInterval(interval);
  }, []);

  const checkTimeLimit = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/time-limit/status');
      const data = await response.json();
      
      if (data.status === 'success' && data.data.isExpired) {
        setShowTimeLimitPopup(true);
        setIsTimeExpired(true);
      }
    } catch (error) {
      console.error('Error checking time limit:', error);
    }
  };

  const checkExistingGuestTypes = async () => {
    if (!mainGuest) return;

    try {
      // Prüfe auf Familie-Gäste
      const familyGuests = await formularService.getAdditionalGuests(mainGuest.id, "family");
      // Prüfe auf Freunde-Gäste
      const friendsGuests = await formularService.getAdditionalGuests(mainGuest.id, "friends");
      
      setExistingGuestTypes({
        hasFamily: familyGuests.length > 0,
        hasFriends: friendsGuests.length > 0
      });

      // Wenn bereits ein Typ vorhanden ist, automatisch diesen auswählen
      if (familyGuests.length > 0 && !friendsGuests.length) {
        setGuestType("family");
      } else if (friendsGuests.length > 0 && !familyGuests.length) {
        setGuestType("friends");
      }
    } catch (error) {
      console.error("Error checking existing guest types:", error);
    }
  };

  const loadAdditionalGuests = async () => {
    if (!mainGuest || !guestType) return;

    try {
      const guests = await formularService.getAdditionalGuests(mainGuest.id, guestType);
      setAdditionalGuests(guests);
    } catch (error) {
      console.error("Error loading additional guests:", error);
      toast.error("Fehler beim Laden der zusätzlichen Gäste");
    }
  };

  const handleEmailVerification = async (businessEmail: string) => {
    try {
      setIsLoading(true);
      console.log("Verifying business email:", businessEmail);
      
      const isValid = await formularService.verifyBusinessEmail({ businessEmail });
      
      if (isValid) {
        setVerifiedBusinessEmail(businessEmail);
        setEmailVerified(true);
        toast.success("Geschäftliche Email erfolgreich verifiziert!");
      } else {
        toast.error("Diese Email ist nicht in unserer Einladungsliste vorhanden.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Fehler bei der Email-Verifizierung");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (data: GuestRegistrationFormData) => {
    try {
      setIsLoading(true);
      console.log("Registering guest:", { ...data, businessEmail: verifiedBusinessEmail });
      
      const guestResponse = await formularService.registerMainGuest({
        name: data.name,
        privateEmail: data.privateEmail,
        businessEmail: verifiedBusinessEmail,
      });
      
      setMainGuest(guestResponse);
      setRegistrationComplete(true);
      toast.success("Registrierung erfolgreich! QR Code wurde erstellt.");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Fehler bei der Registrierung");
    } finally {
      setIsLoading(false);
    }
  };

  const addAdditionalGuest = async () => {
    if (!newGuestName.trim() || !newGuestEmail.trim()) {
      toast.error("Bitte Name und Email eingeben");
      return;
    }

    if (!mainGuest || !guestType) {
      toast.error("Hauptgast oder Gast-Typ nicht gefunden");
      return;
    }

    const maxGuests = guestType === "family" ? 10 : 2;
    if (additionalGuests.length >= maxGuests) {
      toast.error(`Maximal ${maxGuests} ${guestType === "family" ? "Familienmitglieder" : "Freunde"} erlaubt`);
      return;
    }

    try {
      setIsLoading(true);
      const additionalGuestResponse = await formularService.registerAdditionalGuest({
        name: newGuestName,
        email: newGuestEmail,
        mainGuestId: mainGuest.id,
        guestType: guestType,
      });

      setAdditionalGuests([...additionalGuests, additionalGuestResponse]);
      setNewGuestName("");
      setNewGuestEmail("");
      
      // Aktualisiere existingGuestTypes
      setExistingGuestTypes(prev => ({
        ...prev,
        hasFamily: guestType === "family" ? true : prev.hasFamily,
        hasFriends: guestType === "friends" ? true : prev.hasFriends
      }));
      
      toast.success(`${guestType === "family" ? "Familienmitglied" : "Freund"} hinzugefügt und QR Code erstellt`);
    } catch (error) {
      console.error("Error adding additional guest:", error);
      toast.error("Fehler beim Hinzufügen des Gastes");
    } finally {
      setIsLoading(false);
    }
  };

  const removeAdditionalGuest = (guestId: string) => {
    setAdditionalGuests(additionalGuests.filter(guest => guest.id !== guestId));
    
    // Wenn alle Gäste eines Typs entfernt wurden, aktualisiere existingGuestTypes
    const remainingGuests = additionalGuests.filter(guest => guest.id !== guestId);
    if (remainingGuests.length === 0) {
      setExistingGuestTypes(prev => ({
        ...prev,
        hasFamily: guestType === "family" ? false : prev.hasFamily,
        hasFriends: guestType === "friends" ? false : prev.hasFriends
      }));
    }
    
    // TODO: Implement backend deletion if needed
  };

  const selectGuestType = (type: "family" | "friends") => {
    setAdditionalGuests([]);
    setNewGuestName("");
    setNewGuestEmail("");
    setGuestType(type);
  };

  // Email Verification Step
  if (!emailVerified) {
    return (
      <EmailVerificationForm 
        onEmailVerified={handleEmailVerification}
        isLoading={isLoading}
      />
    );
  }

  // Registration Form Step (after email verification)
  if (!registrationComplete) {
    return (
      <GuestRegistrationForm 
        verifiedBusinessEmail={verifiedBusinessEmail}
        onRegistrationComplete={handleRegistrationSubmit}
        isLoading={isLoading}
      />
    );
  }

  // QR Code and Additional Guests
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <QrCode className="h-8 w-8" />
          Registrierung Abgeschlossen
        </h1>
      </div>

      {/* QR Code Display */}
      {mainGuest && <QRCodeDisplay mainGuest={mainGuest} />}

      {/* Guest Type Selection */}
      <GuestTypeSelection
        guestType={guestType}
        existingGuestTypes={existingGuestTypes}
        additionalGuests={additionalGuests}
        newGuestName={newGuestName}
        newGuestEmail={newGuestEmail}
        isLoading={isLoading}
        onGuestTypeSelect={selectGuestType}
        onNewGuestNameChange={setNewGuestName}
        onNewGuestEmailChange={setNewGuestEmail}
        onAddAdditionalGuest={addAdditionalGuest}
        onRemoveAdditionalGuest={removeAdditionalGuest}
        onBackToSelection={() => setGuestType(null)}
      />

      {/* Time Limit Popup */}
      <TimeLimitPopup 
        isOpen={showTimeLimitPopup}
        onClose={() => setShowTimeLimitPopup(false)}
        isExpired={isTimeExpired}
      />
    </div>
  );
};

export default Formular;
