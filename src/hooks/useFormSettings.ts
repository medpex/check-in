import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formSettingsService, FormSettings } from '@/services/formSettingsService';
import { toast } from 'sonner';

export const useFormSettings = () => {
  return useQuery({
    queryKey: ['formSettings'],
    queryFn: () => formSettingsService.getFormSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSaveFormSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Omit<FormSettings, 'id' | 'created_at' | 'updated_at'>) => 
      formSettingsService.saveFormSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSettings'] });
      toast.success('Formular-Einstellungen gespeichert!');
    },
    onError: (error) => {
      console.error('Error saving form settings:', error);
      toast.error('Fehler beim Speichern der Formular-Einstellungen');
    },
  });
}; 