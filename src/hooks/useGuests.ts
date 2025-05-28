
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestService, Guest, CheckedInGuest } from '@/services/guestService';
import { toast } from 'sonner';

export const useGuests = () => {
  return useQuery({
    queryKey: ['guests'],
    queryFn: () => guestService.getAllGuests(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCheckedInGuests = () => {
  return useQuery({
    queryKey: ['checkedInGuests'],
    queryFn: () => guestService.getCheckedInGuests(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => guestService.createGuest(name),
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
    mutationFn: (guestId: string) => guestService.deleteGuest(guestId),
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

export const useCheckInGuest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ guestId, name }: { guestId: string; name: string }) => 
      guestService.checkInGuest(guestId, name),
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
