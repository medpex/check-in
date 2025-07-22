import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getGuests, 
  getCheckedInGuests, 
  createGuest as createGuestService,
  deleteGuest as deleteGuestService,
  updateEmailStatus as updateEmailStatusService,
  checkInGuest as checkInGuestService,
  checkOutGuest as checkOutGuestService,
} from '@/services/guestService';
import { toast } from 'sonner';

export const useGuests = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['guests'],
    queryFn: getGuests,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  return { data, isLoading, refetch };
};

export const useCheckedInGuests = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['checkedInGuests'],
    queryFn: getCheckedInGuests,
    staleTime: 30 * 1000, // 30 seconds
  });
  return { data, isLoading, refetch };
};

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, email, mainGuestId, guestType }: { 
      name: string; 
      email: string; 
      mainGuestId?: string; 
      guestType?: 'family' | 'friends' 
    }) => createGuestService(name, email, mainGuestId, guestType),
    onSuccess: (newGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success(`Einladung für ${newGuest.name} erstellt!`);
    },
    onError: (error) => {
      console.error('Error creating guest:', error);
      toast.error('Fehler beim Erstellen der Einladung');
    },
  });
};

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (guestId: string) => deleteGuestService(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Gast entfernt');
    },
    onError: (error) => {
      console.error('Error deleting guest:', error);
      toast.error('Fehler beim Entfernen des Gastes');
    },
  });
};

export const useUpdateEmailStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ guestId, emailSent }: { guestId: string; emailSent: boolean }) => 
      updateEmailStatusService(guestId, emailSent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
    onError: (error) => {
      console.error('Error updating email status:', error);
      toast.error('Fehler beim Aktualisieren des E-Mail Status');
    },
  });
};

export const useCheckInGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ guestId, name }: { guestId: string; name: string }) => 
      checkInGuestService(guestId, name),
    onSuccess: (checkedInGuest) => {
      queryClient.invalidateQueries({ queryKey: ['checkedInGuests'] });
      toast.success(`${checkedInGuest.name} erfolgreich eingecheckt!`);
    },
    onError: (error) => {
      if (error.message === 'Guest already checked in') {
        toast.warning('Gast ist bereits eingecheckt!');
      } else {
        console.error('Error checking in guest:', error);
        toast.error('Fehler beim Einchecken');
      }
    },
  });
};

export const useCheckOutGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (guestId: string) => checkOutGuestService(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkedInGuests'] });
      toast.success('Gast erfolgreich ausgecheckt!');
    },
    onError: (error) => {
      if (error.message === 'Guest not checked in') {
        toast.warning('Gast ist nicht eingecheckt!');
      } else {
        console.error('Error checking out guest:', error);
        toast.error('Fehler beim Auschecken');
      }
    },
  });
};
