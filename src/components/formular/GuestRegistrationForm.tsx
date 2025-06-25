
import { UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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
  const registrationForm = useForm<GuestRegistrationForm>({
    defaultValues: {
      name: "",
      privateEmail: "",
    },
  });

  const onSubmit = (data: GuestRegistrationForm) => {
    onRegistrationComplete(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-blue-600 to-indigo-700 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <UserPlus className="h-8 w-8" />
              Gast Registrierung
            </h1>
          </div>

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
                <form onSubmit={registrationForm.handleSubmit(onSubmit)} className="space-y-4">
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
                    disabled={isLoading}
                  >
                    {isLoading ? "Registriere..." : "Registrieren"}
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
