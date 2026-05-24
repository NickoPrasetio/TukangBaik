'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { googleCompleteUseCase } from '@/data/auth';
import {
  googleSignupSchema,
  GoogleSignupFormValues,
  UserType,
} from '@/lib/schemas/auth.schema';
import {
  GOOGLE_PENDING_KEY,
  GooglePendingData,
} from './useGoogleLoginMutation';

/**
 * Hook untuk form penyelesaian registrasi Google.
 * Membaca data dari sessionStorage yang disimpan oleh useGoogleLoginMutation,
 * lalu mengirim ke /api/auth/google/complete setelah user memilih tipe akun.
 */
export function useGoogleSignupForm() {
  const { setSession } = useAuthStore();
  const router         = useRouter();

  const [pending,      setPending]     = useState<GooglePendingData | null>(null);
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

  // Baca sessionStorage sekali saat mount
  useEffect(() => {
    const raw = sessionStorage.getItem(GOOGLE_PENDING_KEY);
    if (raw) {
      try {
        setPending(JSON.parse(raw) as GooglePendingData);
      } catch {
        // Data rusak — arahkan ke login
        router.replace('/login');
      }
    } else {
      // Tidak ada data pending → mungkin langsung buka /signup
      // Biarkan SignupForm tampil biasa
    }
  }, [router]);

  function selectUserType(type: UserType) {
    setValue('userType', type, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!pending) return;
    setSubmitError('');

    const result = await googleCompleteUseCase.execute(
      pending.accessToken,
      values.userType,
      values.phone || undefined,
    );

    if (result.success) {
      // Hapus data pending setelah berhasil
      sessionStorage.removeItem(GOOGLE_PENDING_KEY);
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
