import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  changeUserPassword,
  type CreateUserRequest,
  type UpdateUserRequest,
  type ChangePasswordRequest
} from '@/services/userService';
import { toast } from 'sonner';

export const useUsers = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 30 * 1000, // 30 seconds
  });
  return { data, isLoading, refetch };
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Benutzer ${newUser.username} erfolgreich erstellt!`);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Erstellen des Benutzers');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: number; userData: UpdateUserRequest }) => 
      updateUser(userId, userData),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Benutzer ${updatedUser.username} erfolgreich aktualisiert!`);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Benutzers');
    },
  });
};

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, passwordData }: { userId: number; passwordData: ChangePasswordRequest }) => 
      changeUserPassword(userId, passwordData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Passwort erfolgreich geändert!');
    },
    onError: (error) => {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Ändern des Passworts');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Benutzer erfolgreich gelöscht!');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Löschen des Benutzers');
    },
  });
}; 