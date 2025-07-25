
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useFormSettings } from "@/hooks/useFormSettings";
import { getTextColor, getInputBackgroundColor, getButtonBackgroundColor } from "@/lib/colorUtils";

interface EmailVerificationForm {
  businessEmail: string;
}

interface EmailVerificationFormProps {
  onEmailVerified: (email: string) => void;
  isLoading: boolean;
}

export const EmailVerificationForm = ({ onEmailVerified, isLoading }: EmailVerificationFormProps) => {
  const { data: formSettings, isLoading: settingsLoading } = useFormSettings();
  
  const emailForm = useForm<EmailVerificationForm>({
    defaultValues: {
      businessEmail: "",
    },
  });

  const onSubmit = (data: EmailVerificationForm) => {
    onEmailVerified(data.businessEmail);
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
            <Mail className="h-8 w-8" />
            Email Verifizierung
          </h1>
        </div>

        <Card className="backdrop-blur-sm bg-white/20 border-white/30">
          <CardHeader>
            <CardTitle 
              className="text-center"
              style={{ color: textColor }}
            >
              Willkommen!
            </CardTitle>
            <p 
              className="text-center text-sm opacity-80"
              style={{ color: textColor }}
            >
              Bitte geben Sie Ihre geschäftliche Email-Adresse ein, um fortzufahren.
            </p>
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

            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormLabel style={{ color: textColor }}>
                        Geschäftliche Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ihre.geschaeft@unternehmen.com"
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
                  {isLoading ? "Verifiziere..." : "Email verifizieren"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
