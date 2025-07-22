const API_URL = '/api';

async function fetchAPI(url: string, options?: RequestInit) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options?.headers as Record<string, string> || {})
  };

  console.log('🔍 fetchAPI called for:', url);
  console.log('🔍 Headers:', headers);
  console.log('🔍 Token present:', !!token);

  const response = await fetch(url, {
    ...options,
    headers
  });
  
  console.log('🔍 Response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Ein unerwarteter Fehler ist aufgetreten' }));
    console.log('🔍 Error response:', errorData);
    throw new Error(errorData.message || 'API-Anfrage fehlgeschlagen');
  }
  return response.json();
}

export const getGuests = async () => {
  return fetchAPI(`${API_URL}/guests`);
};

export const getCheckedInGuests = async () => {
  return fetchAPI(`${API_URL}/checkins`);
};

export const getEmailStats = async () => {
  return fetchAPI(`${API_URL}/guests/email-stats`);
};

export const sendAllInvitations = async () => {
  return fetchAPI(`${API_URL}/guests/send-all-invitations`, {
    method: 'POST',
  });
};

export const createGuest = async (name: string, email?: string, mainGuestId?: string, guestType?: 'family' | 'friends') => {
  return fetchAPI(`${API_URL}/guests`, {
    method: 'POST',
    body: JSON.stringify({ name, email, main_guest_id: mainGuestId, guest_type: guestType }),
  });
};

export const deleteGuest = async (guestId: string) => {
  return fetchAPI(`${API_URL}/guests/${guestId}`, {
      method: 'DELETE',
    });
};

export const updateEmailStatus = async (guestId: string, emailSent: boolean) => {
  return fetchAPI(`${API_URL}/guests/${guestId}/email-status`, {
      method: 'PATCH',
    body: JSON.stringify({ email_sent: emailSent, email_sent_at: emailSent ? new Date().toISOString() : null }),
    });
};

export const checkInGuest = async (guestId: string, name: string) => {
  console.log('🔍 checkInGuest called with:', { guestId, name });
  const token = localStorage.getItem('authToken');
  console.log('🔍 Token from localStorage:', token ? 'Token exists' : 'No token found');
  
  const result = await fetchAPI(`${API_URL}/checkins`, {
      method: 'POST',
    body: JSON.stringify({ guest_id: guestId, name, timestamp: new Date().toISOString() }),
    });
  
  console.log('🔍 checkInGuest result:', result);
  return result;
};

export const checkOutGuest = async (guestId: string) => {
  return fetchAPI(`${API_URL}/checkins/${guestId}`, {
      method: 'DELETE',
    });
};

export const getBusinessEmailStats = async () => {
  return fetchAPI(`/api/business-emails/email-stats`);
};

export const sendAllBusinessInvitations = async () => {
  return fetchAPI(`/api/business-emails/send-all-invitations`, {
    method: 'POST',
  });
};
