const API_URL = '/api';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'scanner';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string;
  role?: 'admin' | 'scanner';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'admin' | 'scanner';
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  password: string;
}

async function fetchAPI(url: string, options?: RequestInit) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options?.headers as Record<string, string> || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Ein unerwarteter Fehler ist aufgetreten' }));
    throw new Error(errorData.message || 'API-Anfrage fehlgeschlagen');
  }
  return response.json();
}

export const getUsers = async (): Promise<User[]> => {
  return fetchAPI(`${API_URL}/users`);
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  return fetchAPI(`${API_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<User> => {
  return fetchAPI(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const changeUserPassword = async (userId: number, passwordData: ChangePasswordRequest): Promise<{ message: string }> => {
  return fetchAPI(`${API_URL}/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify(passwordData),
  });
};

export const deleteUser = async (userId: number): Promise<{ message: string }> => {
  return fetchAPI(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  });
}; 