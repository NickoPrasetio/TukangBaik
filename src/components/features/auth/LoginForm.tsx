'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useGoogleLoginMutation } from '@/hooks/useGoogleLoginMutation';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginForm() {
  const router = useRouter();

  function handleSuccess() {
    const { user } = useAuthStore.getState();
    router.push(user?.userType === 'TUKANG' ? '/tukang-dashboard' : '/dashboard');
  }

  const { register, errors, isSubmitting, submitError, onSubmit } =
    useLoginForm(handleSuccess);

  const { mutate: googleLogin, isLoading: googleLoading, error: googleError } =
    useGoogleLoginMutation(handleSuccess);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>

      {/* Google Sign-In */}
      <GoogleLoginButton
        onToken={googleLogin}
        isLoading={googleLoading}
        label="Masuk dengan Google"
      />

      {googleError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{googleError}</p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">atau dengan email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Input label="Email" type="email" placeholder="email@contoh.com"
        icon={<Mail size={18} />} error={errors.email?.message} autoComplete="email"
        {...register('email')} />

      <Input label="Password" type="password" placeholder="Masukkan password"
        icon={<Lock size={18} />} error={errors.password?.message} autoComplete="current-password"
        {...register('password')} />

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-1">
        Masuk
      </Button>

      <p className="text-center text-sm text-gray-500">
        Belum punya akun?{' '}
        <Link href="/signup" className="font-semibold text-blue-500 hover:underline">Daftar sekarang</Link>
      </p>
    </form>
  );
}
