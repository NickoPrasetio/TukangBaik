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
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email, password) => {
        try {
          const res = await authApi.login(email, password);
          set({
            user: { id: res.id, name: res.name, email: res.email, phone: res.phone, role: res.role },
            token: res.token,
            isAuthenticated: true,
            isAdmin: res.role === 'ROLE_ADMIN',
          });
          return true;
        } catch {
          return false;
        }
      },

      signup: async (name, email, password, phone) => {
        try {
          const res = await authApi.register(name, email, password, phone);
          set({
            user: { id: res.id, name: res.name, email: res.email, phone: res.phone, role: res.role },
            token: res.token,
            isAuthenticated: true,
            isAdmin: res.role === 'ROLE_ADMIN',
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),
    }),
    { name: 'auth-storage' }
  )
);
