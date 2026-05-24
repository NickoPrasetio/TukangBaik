'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { signupSchema, SignupFormValues, UserType } from '@/lib/schemas/auth.schema';
import { signupUseCase } from '@/data/auth';
import { useLocation } from './useLocation';

export function useSignupForm(
  /** Navigasi diserahkan ke pemanggil — hook tidak tahu kemana harus pergi */
  onSuccess: () => void,
) {
  const { setSession } = useAuthStore();
  const location       = useLocation();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const userType = watch('userType');

  function selectUserType(type: UserType) {
    setValue('userType', type, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');

    const result = await signupUseCase.execute({
      name:      values.name,
      email:     values.email,
      password:  values.password,
      phone:     values.phone,
      userType:  values.userType,
      latitude:  location.latitude,
      longitude: location.longitude,
    });

    if (result.success) {
      setSession(result.data.user, result.data.token);
      onSuccess(); // ← komponen yang menentukan tujuan navigasi
    } else {
      setSubmitError(result.error.message); // ← pesan error spesifik, bukan hanya "false"
    }
  });

  return {
    register,
    errors,
    isSubmitting,
    submitError,
    userType,
    selectUserType,
    location,
    onSubmit,
  };
}
