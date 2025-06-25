
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface EmailVerificationForm {
  businessEmail: string;
}

interface EmailVerificationFormProps {
  onEmailVerified: (email: string) => void;
  isLoading: boolean;
}

export const EmailVerificationForm = ({ onEmailVerified, isLoading }: EmailVerificationFormProps) => {
  const emailForm = useForm<EmailVerificationForm>({
    defaultValues: {
      businessEmail: "",
    },
  });

  const onSubmit = (data: EmailVerificationForm) => {
    onEmailVerified(data.businessEmail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-8">
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifiziere..." : "Email verifizieren"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <footer className="bg-black/20 border-t border-white/20 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/70 text-sm">© Jakob Ejne 2025</p>
        </div>
      </footer>
    </div>
  );
};
