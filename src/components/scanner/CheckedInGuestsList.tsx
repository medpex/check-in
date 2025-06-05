
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckedInGuest } from "@/services/guestService";

interface CheckedInGuestsListProps {
  guests: CheckedInGuest[];
}

export const CheckedInGuestsList = ({ guests }: CheckedInGuestsListProps) => {
  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30">
      <CardHeader>
        <CardTitle className="text-white">Eingecheckte Gäste ({guests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {guests.length === 0 ? (
            <p className="text-white/70 text-center py-8">
              Noch keine Gäste eingecheckt
            </p>
          ) : (
            guests.map((guest) => (
              <div 
                key={guest.id}
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{guest.name}</p>
                  <p className="text-white/70 text-sm">
                    {new Date(guest.timestamp).toLocaleString('de-DE')}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
