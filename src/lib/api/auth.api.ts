import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone: string) =>
    apiClient.post<AuthResponse>('/api/auth/register', { name, email, password, phone }),
};
