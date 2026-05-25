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

/**
 * Response dari POST /api/auth/google.
 * newUser == true  → user belum ada; hanya name/email/avatar yang diisi.
 * newUser == false → user sudah ada; token + profil lengkap disertakan.
 */
export interface GoogleCheckResponse {
  newUser: boolean;
  // existing user
  token?: string;
  id?: string;
  phone?: string;
  role?: string;
  userType?: string;
  latitude?: number;
  longitude?: number;
  // always present (from Google)
  name?: string;
  email?: string;
  avatar?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone: string, userType: string, latitude?: number, longitude?: number) =>
    apiClient.post<AuthResponse>('/api/auth/register', { name, email, password, phone, userType, latitude, longitude }),

  /** Step 1: cek apakah user Google sudah ada di DB */
  googleCheck: (accessToken: string) =>
    apiClient.post<GoogleCheckResponse>('/api/auth/google', { accessToken }),

  /** Step 2: selesaikan registrasi Google (hanya untuk user baru) */
  googleComplete: (accessToken: string, userType: string, phone?: string) =>
    apiClient.post<AuthResponse>('/api/auth/google/complete', { accessToken, userType, phone }),

  /** Step 1: cek apakah user Facebook sudah ada di DB */
  facebookCheck: (accessToken: string) =>
    apiClient.post<GoogleCheckResponse>('/api/auth/facebook', { accessToken }),

  /** Step 2: selesaikan registrasi Facebook (hanya untuk user baru) */
  facebookComplete: (accessToken: string, userType: string, phone?: string) =>
    apiClient.post<AuthResponse>('/api/auth/facebook/complete', { accessToken, userType, phone }),

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
