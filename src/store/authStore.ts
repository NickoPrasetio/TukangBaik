import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
}

const DUMMY_USERS: (User & { password: string })[] = [
  {
    id: 'u1',
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '08123456789',
    password: 'password123',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 800));
        const found = DUMMY_USERS.find((u) => u.email === email && u.password === password);
        if (found) {
          const { password: _, ...user } = found;
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: async (name, email, _password, phone) => {
        await new Promise((r) => setTimeout(r, 800));
        const newUser: User = {
          id: `u${Date.now()}`,
          name,
          email,
          phone,
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
