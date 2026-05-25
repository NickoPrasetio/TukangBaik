'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { facebookCheckUseCase } from '@/data/auth';
import { OAUTH_PENDING_KEY, OAuthPendingData } from './useGoogleLoginMutation';

/**
 * Hook untuk handle Facebook Sign-In.
 * Jika user sudah ada → login langsung.
 * Jika user baru → simpan ke sessionStorage, redirect ke /signup.
 */
export function useFacebookLoginMutation(onSuccess: () => void) {
  const { setSession } = useAuthStore();
  const router         = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  async function mutate(accessToken: string) {
    setIsLoading(true);
    setError('');
    try {
      const result = await facebookCheckUseCase.execute(accessToken);

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      const data = result.data;

      if (data.isNewUser) {
        const pending: OAuthPendingData = {
          provider: 'facebook',
          accessToken,
          name:   data.name,
          email:  data.email,
          avatar: data.avatar,
        };
        sessionStorage.setItem(OAUTH_PENDING_KEY, JSON.stringify(pending));
        router.push('/signup');
      } else {
        setSession(data.session.user, data.session.token);
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { mutate, isLoading, error };
}
