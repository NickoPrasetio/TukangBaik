import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/lib/api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string, userType: string, latitude?: number, longitude?: number) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<boolean>;
  updateAvatar: (file: File) => Promise<boolean>;
}

function toUser(res: { id: string; name: string; email: string; phone?: string; role: string; avatar?: string; userType?: string; latitude?: number; longitude?: number }): User {
  return { id: res.id, name: res.name, email: res.email, phone: res.phone, role: res.role, avatar: res.avatar, userType: res.userType, latitude: res.latitude, longitude: res.longitude };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email, password) => {
        try {
          const res = await authApi.login(email, password);
          set({ user: toUser(res), token: res.token, isAuthenticated: true, isAdmin: res.role === 'ROLE_ADMIN' });
          return true;
        } catch { return false; }
      },

      signup: async (name, email, password, phone, userType, latitude, longitude) => {
        try {
          const res = await authApi.register(name, email, password, phone, userType, latitude, longitude);
          set({ user: toUser(res), token: res.token, isAuthenticated: true, isAdmin: res.role === 'ROLE_ADMIN' });
          return true;
        } catch { return false; }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),

      updateProfile: async (data) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await authApi.updateMe(data, token);
          set((s) => ({ user: { ...s.user!, ...toUser(res) } }));
          return true;
        } catch { return false; }
      },

      updateAvatar: async (file) => {
        const { token } = get();
        if (!token) return false;
        try {
          const res = await authApi.uploadAvatar(file, token);
          set((s) => ({ user: { ...s.user!, avatar: res.avatar } }));
          return true;
        } catch { return false; }
      },
    }),
    { name: 'auth-storage' }
  )
);
