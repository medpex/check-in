
import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface EmailForm {
  email: string;
}

interface EmailInputDialogProps {
  onSendEmail: (email: string) => void;
  isLoading: boolean;
  buttonText: string;
  dialogTitle: string;
  emailLabel?: string;
  emailPlaceholder?: string;
}

export const EmailInputDialog = ({ 
  onSendEmail, 
  isLoading, 
  buttonText, 
  dialogTitle,
  emailLabel = "E-Mail-Adresse",
  emailPlaceholder = "beispiel@email.com"
}: EmailInputDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const emailForm = useForm<EmailForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: EmailForm) => {
    onSendEmail(data.email);
    setOpen(false);
    emailForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-white/20 hover:bg-white/30 text-white">
          <Mail className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-sm bg-white/95 border-white/30">
        <DialogHeader>
          <DialogTitle className="text-center">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              rules={{ 
                required: "E-Mail-Adresse ist erforderlich",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Ungültige E-Mail-Adresse"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{emailLabel}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={emailPlaceholder}
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
              disabled={isLoading}
            >
              {isLoading ? "Sende..." : "E-Mail senden"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
