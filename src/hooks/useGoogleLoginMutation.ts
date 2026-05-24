'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { googleCheckUseCase } from '@/data/auth';

export const GOOGLE_PENDING_KEY = 'google_pending';

/** Data yang disimpan sementara di sessionStorage untuk form completion */
export interface GooglePendingData {
  accessToken: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Hook untuk handle Google Sign-In dengan dua kemungkinan hasil:
 * 1. User sudah ada  → login langsung, panggil onSuccess()
 * 2. User baru       → simpan data ke sessionStorage, redirect ke /signup
 */
export function useGoogleLoginMutation(onSuccess: () => void) {
  const { setSession } = useAuthStore();
  const router         = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  async function mutate(accessToken: string) {
    setIsLoading(true);
    setError('');
    try {
      const result = await googleCheckUseCase.execute(accessToken);

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      const data = result.data;

      if (data.isNewUser) {
        // Pengguna baru — simpan ke sessionStorage dan arahkan ke signup
        const pending: GooglePendingData = {
          accessToken,
          name:   data.name,
          email:  data.email,
          avatar: data.avatar,
        };
        sessionStorage.setItem(GOOGLE_PENDING_KEY, JSON.stringify(pending));
        router.push('/signup');
      } else {
        // Pengguna lama — login langsung
        setSession(data.session.user, data.session.token);
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { mutate, isLoading, error };
}
