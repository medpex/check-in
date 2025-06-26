
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smtpService, SMTPConfig, EmailResponse } from '@/services/smtpService';
import { toast } from 'sonner';

export const useSMTPConfig = () => {
  return useQuery({
    queryKey: ['smtpConfig'],
    queryFn: () => smtpService.getSMTPConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSaveSMTPConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>) => 
      smtpService.saveSMTPConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtpConfig'] });
      toast.success('SMTP-Konfiguration gespeichert!');
    },
    onError: (error) => {
      console.error('Error saving SMTP config:', error);
      toast.error('Fehler beim Speichern der SMTP-Konfiguration');
    },
  });
};

export const useTestSMTPConnection = () => {
  return useMutation({
    mutationFn: (config: Omit<SMTPConfig, 'id' | 'created_at' | 'updated_at'>) => 
      smtpService.testSMTPConnection(config),
    onSuccess: (result: EmailResponse) => {
      if (result.success) {
        toast.success('SMTP-Verbindung erfolgreich getestet!');
      } else {
        toast.error(`SMTP-Test fehlgeschlagen: ${result.message}`);
      }
    },
    onError: (error) => {
      console.error('Error testing SMTP connection:', error);
      toast.error('Fehler beim Testen der SMTP-Verbindung');
    },
  });
};

export const useSendInvitationEmail = () => {
  return useMutation({
    mutationFn: ({ guestId, recipientEmail }: { guestId: string; recipientEmail: string }) => 
      smtpService.sendInvitationEmail(guestId, recipientEmail),
    onSuccess: (result: EmailResponse) => {
      if (result.success) {
        toast.success('Einladungs-E-Mail erfolgreich versendet!');
      } else {
        toast.error(`E-Mail-Versand fehlgeschlagen: ${result.message}`);
      }
    },
    onError: (error) => {
      console.error('Error sending invitation email:', error);
      toast.error('Fehler beim Versenden der Einladungs-E-Mail');
    },
  });
};

export const useSendBusinessInviteEmail = () => {
  return useMutation({
    mutationFn: (businessEmail: string) => 
      smtpService.sendBusinessInviteEmail(businessEmail),
    onSuccess: (result: EmailResponse) => {
      if (result.success) {
        toast.success('Geschäfts-E-Mail erfolgreich versendet!');
      } else {
        toast.error(`E-Mail-Versand fehlgeschlagen: ${result.message}`);
      }
    },
    onError: (error) => {
      console.error('Error sending business invite email:', error);
      toast.error('Fehler beim Versenden der Geschäfts-E-Mail');
    },
  });
};

export const useSendQRCodeEmail = () => {
  return useMutation({
    mutationFn: ({ guestId, recipientEmail }: { guestId: string; recipientEmail: string }) => 
      smtpService.sendQRCodeEmail(guestId, recipientEmail),
    onSuccess: (result: EmailResponse) => {
      if (result.success) {
        toast.success('QR-Code-E-Mail erfolgreich versendet!');
      } else {
        toast.error(`E-Mail-Versand fehlgeschlagen: ${result.message}`);
      }
    },
    onError: (error) => {
      console.error('Error sending QR code email:', error);
      toast.error('Fehler beim Versenden der QR-Code-E-Mail');
    },
  });
};
