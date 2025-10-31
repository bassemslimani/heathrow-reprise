/**
 * Authentication Service
 * Handles user registration, login, and authentication
 */
import apiClient, { setAuthToken, setUserData, removeAuthToken } from './api';

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  num_identite?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  ville?: string;
  pays?: string;
  role?: 'passenger' | 'visitor';
  ticket_number?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  num_identite?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  ville?: string;
  pays?: string;
  role: string;
  ticket_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);

    // Save token and user data
    setAuthToken(response.data.access_token);
    setUserData(response.data.user);

    return response.data;
  }

  /**
   * Login a user
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

    // Save token and user data
    setAuthToken(response.data.access_token);
    setUserData(response.data.user);

    return response.data;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove local data
      removeAuthToken();
    }
  }

  /**
   * Validate a ticket number
   */
  async validateTicket(ticketNumber: string): Promise<any> {
    const response = await apiClient.post('/api/auth/validate-ticket', {
      ticket_number: ticketNumber,
    });

    return response.data;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');

    // Update stored user data
    setUserData(response.data);

    return response.data;
  }
}

export default new AuthService();
