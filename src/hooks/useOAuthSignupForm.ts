'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { googleCompleteUseCase, facebookCompleteUseCase } from '@/data/auth';
import {
  googleSignupSchema,
  GoogleSignupFormValues,
  UserType,
} from '@/lib/schemas/auth.schema';
import { OAUTH_PENDING_KEY, OAuthPendingData } from './useGoogleLoginMutation';

/**
 * Hook tunggal untuk form penyelesaian registrasi via OAuth (Google atau Facebook).
 * Membaca data dari sessionStorage, menentukan provider, lalu memanggil
 * use case yang sesuai saat submit.
 */
export function useOAuthSignupForm() {
  const { setSession } = useAuthStore();
  const router         = useRouter();

  const [pending,      setPending]     = useState<OAuthPendingData | null>(null);
  const [submitError,  setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoogleSignupFormValues>({
    resolver: zodResolver(googleSignupSchema),
  });

  const userType = watch('userType');

  useEffect(() => {
    const raw = sessionStorage.getItem(OAUTH_PENDING_KEY);
    if (raw) {
      try {
        setPending(JSON.parse(raw) as OAuthPendingData);
      } catch {
        router.replace('/login');
      }
    }
  }, [router]);

  function selectUserType(type: UserType) {
    setValue('userType', type, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!pending) return;
    setSubmitError('');

    const completeUseCase =
      pending.provider === 'facebook' ? facebookCompleteUseCase : googleCompleteUseCase;

    const result = await completeUseCase.execute(
      pending.accessToken,
      values.userType,
      values.phone || undefined,
    );

    if (result.success) {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      setSession(result.data.user, result.data.token);
      const { user } = useAuthStore.getState();
      router.push(user?.userType === 'TUKANG' ? '/tukang-dashboard' : '/dashboard');
    } else {
      setSubmitError(result.error.message);
    }
  });

  return {
    pending,
    register,
    errors,
    isSubmitting,
    submitError,
    userType,
    selectUserType,
    onSubmit,
  };
}
