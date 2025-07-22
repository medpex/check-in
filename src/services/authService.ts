export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private baseUrl = '/api/auth';

  // Token im localStorage speichern
  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Token aus localStorage abrufen
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Token aus localStorage entfernen
  private removeToken(): void {
    localStorage.removeItem('authToken');
  }

  // Login
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login fehlgeschlagen');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  // Logout
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.removeToken();
  }

  // Passwort ändern
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Nicht angemeldet');
    }

    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Passwort-Änderung fehlgeschlagen');
    }

    // Nach Passwort-Änderung wird der Benutzer abgemeldet
    this.removeToken();
  }

  // Aktuellen Benutzer abrufen
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      this.removeToken();
      return null;
    }
  }

  // Token validieren
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.removeToken();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.removeToken();
      return false;
    }
  }

  // Authentifizierten Request machen
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Nicht angemeldet');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Auth State abrufen
  getAuthState(): AuthState {
    const token = this.getToken();
    return {
      user: null, // Wird durch getCurrentUser() gesetzt
      token,
      isAuthenticated: !!token,
    };
  }
}

export const authService = new AuthService(); 