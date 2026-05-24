import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

// ─── ISP: pisah read state dari write actions ─────────────────────────────────

interface AuthSessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthSessionActions {
  /** Dipanggil setelah login/signup berhasil */
  setSession: (user: User, token: string) => void;
  /** Dipanggil saat logout */
  clearSession: () => void;
  /** Dipanggil setelah update profile/avatar — partial update */
  setUser: (partial: Partial<User>) => void;
}

type AuthStore = AuthSessionState & AuthSessionActions;

// ─── Store — HANYA menyimpan dan memutasi state ───────────────────────────────
// Tidak ada API call, tidak ada business logic, tidak ada navigation.

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user:            null,
      token:           null,
      isAuthenticated: false,
      isAdmin:         false,

      // Pure state mutations
      setSession: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'ROLE_ADMIN',
        }),

      clearSession: () =>
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),

      setUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    { name: 'auth-storage' },
  ),
);
