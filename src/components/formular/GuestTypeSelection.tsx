
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestResponse } from "@/services/formularService";

interface GuestTypeSelectionProps {
  guestType: "family" | "friends" | null;
  existingGuestTypes: {
    hasFamily: boolean;
    hasFriends: boolean;
  };
  additionalGuests: GuestResponse[];
  newGuestName: string;
  newGuestEmail: string;
  isLoading: boolean;
  onGuestTypeSelect: (type: "family" | "friends") => void;
  onNewGuestNameChange: (name: string) => void;
  onNewGuestEmailChange: (email: string) => void;
  onAddAdditionalGuest: () => void;
  onRemoveAdditionalGuest: (guestId: string) => void;
  onBackToSelection: () => void;
}

export const GuestTypeSelection = ({
  guestType,
  existingGuestTypes,
  additionalGuests,
  newGuestName,
  newGuestEmail,
  isLoading,
  onGuestTypeSelect,
  onNewGuestNameChange,
  onNewGuestEmailChange,
  onAddAdditionalGuest,
  onRemoveAdditionalGuest,
  onBackToSelection,
}: GuestTypeSelectionProps) => {
  // Guest Type Selection
  if (!guestType) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center">Zusätzliche Gäste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-center text-sm">
            Möchten Sie weitere Personen anmelden? Wählen Sie eine Option:
          </p>
          
          {/* Zeige Info wenn bereits Gäste vorhanden sind */}
          {(existingGuestTypes.hasFamily || existingGuestTypes.hasFriends) && (
            <div className="bg-blue-500/20 p-3 rounded text-center">
              <p className="text-white/80 text-sm">
                Sie haben bereits {existingGuestTypes.hasFamily ? "Familienmitglieder" : "Freunde"} registriert.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => onGuestTypeSelect("family")}
              className="w-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={existingGuestTypes.hasFriends}
            >
              <Users className="h-4 w-4 mr-2" />
              Familienmitglieder (bis zu 10)
              {existingGuestTypes.hasFriends && (
                <span className="ml-2 text-xs">(nicht verfügbar - bereits Freunde registriert)</span>
              )}
            </Button>
            <Button 
              onClick={() => onGuestTypeSelect("friends")}
              className="w-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={existingGuestTypes.hasFamily}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Freunde (bis zu 2)
              {existingGuestTypes.hasFamily && (
                <span className="ml-2 text-xs">(nicht verfügbar - bereits Familie registriert)</span>
              )}
            </Button>
          </div>
          <p className="text-white/60 text-center text-xs">
            Sie können entweder Familienmitglieder ODER Freunde hinzufügen, nicht beides.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Additional Guests Form
  return (
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
            onChange={(e) => onNewGuestNameChange(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
          <Input
            type="email"
            placeholder="Email"
            value={newGuestEmail}
            onChange={(e) => onNewGuestEmailChange(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
          <Button 
            onClick={onAddAdditionalGuest}
            className="w-full bg-white/20 hover:bg-white/30 text-white"
            disabled={additionalGuests.length >= (guestType === "family" ? 10 : 2) || isLoading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isLoading ? "Wird hinzugefügt..." : `${guestType === "family" ? "Familienmitglied" : "Freund"} hinzufügen`}
          </Button>
        </div>

        {/* Additional Guests List */}
        {additionalGuests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">
              Hinzugefügte {guestType === "family" ? "Familienmitglieder" : "Freunde"}:
            </h4>
            {additionalGuests.map((guest) => (
              <div key={guest.id} className="bg-white/10 p-3 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm">
                    <div>{guest.name}</div>
                    <div className="text-white/70 text-xs">{guest.email}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveAdditionalGuest(guest.id)}
                    className="bg-red-500/20 hover:bg-red-500/30"
                  >
                    Entfernen
                  </Button>
                </div>
                {guest.qr_code && (
                  <div className="bg-white p-2 rounded">
                    <img 
                      src={guest.qr_code} 
                      alt={`QR Code für ${guest.name}`}
                      className="w-full max-w-[100px] mx-auto"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={onBackToSelection}
          variant="outline"
          className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
        >
          Zurück zur Auswahl
        </Button>
      </CardContent>
    </Card>
  );
};
