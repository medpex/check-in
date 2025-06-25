
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessEmailService, BusinessEmail } from '@/services/businessEmailService';
import { toast } from 'sonner';

export const useBusinessEmails = () => {
  return useQuery({
    queryKey: ['businessEmails'],
    queryFn: () => businessEmailService.getAllBusinessEmails(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddBusinessEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, company }: { email: string; company?: string }) => 
      businessEmailService.addBusinessEmail(email, company),
    onSuccess: (newEmail) => {
      queryClient.invalidateQueries({ queryKey: ['businessEmails'] });
      toast.success(`Geschäftsemail ${newEmail.email} hinzugefügt!`);
    },
    onError: (error: Error) => {
      console.error('Error adding business email:', error);
      toast.error(error.message || 'Fehler beim Hinzufügen der Geschäftsemail');
    },
  });
};

export const useDeleteBusinessEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => businessEmailService.deleteBusinessEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessEmails'] });
      toast.success('Geschäftsemail entfernt');
    },
    onError: (error: Error) => {
      console.error('Error deleting business email:', error);
      toast.error('Fehler beim Entfernen der Geschäftsemail');
    },
  });
};

export const useVerifyBusinessEmail = () => {
  return useMutation({
    mutationFn: (email: string) => businessEmailService.verifyBusinessEmail(email),
    onError: (error: Error) => {
      console.error('Error verifying business email:', error);
      toast.error('Fehler bei der Email-Verifizierung');
    },
  });
};
