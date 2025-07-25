
import { UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useFormSettings } from "@/hooks/useFormSettings";
import { getTextColor, getInputBackgroundColor, getButtonBackgroundColor } from "@/lib/colorUtils";

interface GuestRegistrationForm {
  name: string;
  privateEmail: string;
}

interface GuestRegistrationFormProps {
  verifiedBusinessEmail: string;
  onRegistrationComplete: (data: GuestRegistrationForm) => void;
  isLoading: boolean;
}

export const GuestRegistrationForm = ({ 
  verifiedBusinessEmail, 
  onRegistrationComplete, 
  isLoading 
}: GuestRegistrationFormProps) => {
  const { data: formSettings, isLoading: settingsLoading } = useFormSettings();
  
  const registrationForm = useForm<GuestRegistrationForm>({
    defaultValues: {
      name: "",
      privateEmail: "",
    },
  });

  const onSubmit = (data: GuestRegistrationForm) => {
    onRegistrationComplete(data);
  };

  // Verwende Standardwerte falls Einstellungen noch nicht geladen sind
  const backgroundColor = formSettings?.background_color || '#3B82F6';
  const logoUrl = formSettings?.logo_url;
  const textColor = getTextColor(backgroundColor);
  const inputBgColor = getInputBackgroundColor(backgroundColor);
  const buttonBgColor = getButtonBackgroundColor(backgroundColor);

  return (
    <div 
      className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center"
      style={{ backgroundColor }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 
            className="text-3xl font-bold flex items-center gap-2"
            style={{ color: textColor }}
          >
            <UserPlus className="h-8 w-8" />
            Gast Registrierung
          </h1>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span 
            className="text-sm opacity-80"
            style={{ color: textColor }}
          >
            Email verifiziert: {verifiedBusinessEmail}
          </span>
        </div>

        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardHeader>
            <CardTitle 
              className="text-center"
              style={{ color: textColor }}
            >
              Persönliche Daten
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Logo anzeigen falls vorhanden */}
            {logoUrl && (
              <div className="flex justify-center mb-6">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <Form {...registrationForm}>
              <form onSubmit={registrationForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={registrationForm.control}
                  name="name"
                  rules={{ required: "Name ist erforderlich" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: textColor }}>
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ihr vollständiger Name"
                          className="border-white/30 placeholder:text-white/70"
                          style={{ 
                            backgroundColor: inputBgColor,
                            color: textColor,
                            borderColor: textColor + '30'
                          }}
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
                      <FormLabel style={{ color: textColor }}>
                        Private Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ihre.private@email.com"
                          className="border-white/30 placeholder:text-white/70"
                          style={{ 
                            backgroundColor: inputBgColor,
                            color: textColor,
                            borderColor: textColor + '30'
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  style={{ 
                    backgroundColor: buttonBgColor,
                    color: textColor,
                    borderColor: textColor + '30'
                  }}
                  disabled={isLoading || settingsLoading}
                >
                  {isLoading ? "Registriere..." : "Registrieren"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
