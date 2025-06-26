import { useState } from "react";
import { Users, UserPlus, Trash2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuestResponse } from "@/services/formularService";
import { useSendQRCodeEmail } from "@/hooks/useSMTP";

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
  const sendQRCodeEmail = useSendQRCodeEmail();

  const handleSendGuestQRCode = (guestId: string, email: string) => {
    sendQRCodeEmail.mutate({ guestId, recipientEmail: email });
  };

  // Zeige Gast-Typ-Auswahl an
  if (!guestType) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center">
            Möchten Sie weitere Gäste hinzufügen?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onGuestTypeSelect("family")}
              className="bg-white/20 hover:bg-white/30 text-white flex flex-col items-center p-6 h-auto"
              disabled={isLoading}
            >
              <Users className="h-8 w-8 mb-2" />
              <span className="text-sm">Familie</span>
              <span className="text-xs text-white/70">bis zu 10 Personen</span>
              {existingGuestTypes.hasFamily && (
                <Badge className="mt-2 bg-green-500/20 text-white">
                  Bereits vorhanden
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={() => onGuestTypeSelect("friends")}
              className="bg-white/20 hover:bg-white/30 text-white flex flex-col items-center p-6 h-auto"
              disabled={isLoading}
            >
              <UserPlus className="h-8 w-8 mb-2" />
              <span className="text-sm">Freunde</span>
              <span className="text-xs text-white/70">bis zu 2 Personen</span>
              {existingGuestTypes.hasFriends && (
                <Badge className="mt-2 bg-green-500/20 text-white">
                  Bereits vorhanden
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Zeige das ausgewählte Gast-Typ-Interface
  const maxGuests = guestType === "family" ? 10 : 2;
  const guestTypeLabel = guestType === "family" ? "Familienmitglieder" : "Freunde";

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            onClick={onBackToSelection}
            variant="outline"
            size="icon"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-white">
            {guestTypeLabel} hinzufügen
          </CardTitle>
        </div>
        <p className="text-white/70 text-sm">
          {additionalGuests.length} von {maxGuests} {guestTypeLabel.toLowerCase()} hinzugefügt
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Neue Gäste hinzufügen */}
        {additionalGuests.length < maxGuests && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={newGuestName}
                onChange={(e) => onNewGuestNameChange(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                disabled={isLoading}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newGuestEmail}
                onChange={(e) => onNewGuestEmailChange(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={onAddAdditionalGuest}
              className="w-full bg-white/20 hover:bg-white/30 text-white"
              disabled={isLoading || !newGuestName.trim() || !newGuestEmail.trim()}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isLoading ? "Hinzufügen..." : `${guestType === "family" ? "Familienmitglied" : "Freund"} hinzufügen`}
            </Button>
          </div>
        )}

        {/* Liste der hinzugefügten Gäste */}
        {additionalGuests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Hinzugefügte {guestTypeLabel}:</h3>
            <div className="space-y-3">
              {additionalGuests.map((guest) => (
                <Card key={guest.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{guest.name}</p>
                        <p className="text-white/70 text-sm">{guest.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* QR Code anzeigen - vergrößert */}
                        {guest.qr_code && (
                          <div className="bg-white p-2 rounded">
                            <img 
                              src={guest.qr_code} 
                              alt={`QR Code für ${guest.name}`}
                              className="w-16 h-16"
                            />
                          </div>
                        )}
                        {/* E-Mail-Button für Freunde - nutzt vorhandene E-Mail */}
                        {guestType === "friends" && (
                          <Button
                            onClick={() => handleSendGuestQRCode(guest.id, guest.email)}
                            disabled={sendQRCodeEmail.isPending}
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => onRemoveAdditionalGuest(guest.id)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-500/20 hover:bg-red-500/30"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
