import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  userType?: string;
  latitude?: number;
  longitude?: number;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone: string, userType: string, latitude?: number, longitude?: number) =>
    apiClient.post<AuthResponse>('/api/auth/register', { name, email, password, phone, userType, latitude, longitude }),

  getMe: (token: string) =>
    apiClient.get<AuthResponse>('/api/auth/me', token),

  updateMe: (data: { name?: string; phone?: string }, token: string) =>
    apiClient.put<AuthResponse>('/api/auth/me', data, token),

  uploadAvatar: (file: File, token: string) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.upload<AuthResponse>('/api/auth/me/photo', form, token);
  },

  getAllUsers: (token: string) =>
    apiClient.get<AuthResponse[]>('/api/auth/users', token),

  adminUpdateUser: (id: string, data: { name?: string; phone?: string }, token: string) =>
    apiClient.put<AuthResponse>(`/api/auth/users/${id}`, data, token),

  adminUploadUserAvatar: (id: string, file: File, token: string) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.upload<AuthResponse>(`/api/auth/users/${id}/photo`, form, token);
  },
};
