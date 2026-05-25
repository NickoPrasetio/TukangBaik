'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Lock, Phone, MapPin,
  HardHat, ShoppingBag, CheckCircle2,
  AlertCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { useSignupForm } from '@/hooks/useSignupForm';
import { useGoogleLoginMutation, OAUTH_PENDING_KEY } from '@/hooks/useGoogleLoginMutation';
import { useFacebookLoginMutation } from '@/hooks/useFacebookLoginMutation';
import { UserType } from '@/lib/schemas/auth.schema';
import { LocationState } from '@/hooks/useLocation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import GoogleLoginButton from './GoogleLoginButton';
import FacebookLoginButton from './FacebookLoginButton';
import OAuthSignupForm from './OAuthSignupForm';
import { useAuthStore } from '@/store/authStore';

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserTypeSelector({
  value,
  onSelect,
  error,
}: {
  value: UserType | undefined;
  onSelect: (t: UserType) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Tipe Akun</label>
      <div className="grid grid-cols-2 gap-3">
        <TypeCard
          active={value === 'CUSTOMER'}
          icon={<ShoppingBag size={20} />}
          label="Customer"
          description="Cari & booking tukang"
          activeColor="blue"
          onClick={() => onSelect('CUSTOMER')}
        />
        <TypeCard
          active={value === 'TUKANG'}
          icon={<HardHat size={20} />}
          label="Tukang"
          description="Tawarkan jasa Anda"
          activeColor="orange"
          onClick={() => onSelect('TUKANG')}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function TypeCard({
  active, icon, label, description, activeColor, onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  activeColor: 'blue' | 'orange';
  onClick: () => void;
}) {
  const c = {
    blue: {
      border:   active ? 'border-blue-500 bg-blue-50'   : 'border-gray-200 bg-white hover:border-blue-300',
      iconBg:   active ? 'bg-blue-500'   : 'bg-gray-100',
      iconText: active ? 'text-white'    : 'text-gray-500',
      label:    active ? 'text-blue-600' : 'text-gray-700',
      check:    'text-blue-500',
    },
    orange: {
      border:   active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300',
      iconBg:   active ? 'bg-orange-500'   : 'bg-gray-100',
      iconText: active ? 'text-white'      : 'text-gray-500',
      label:    active ? 'text-orange-600' : 'text-gray-700',
      check:    'text-orange-500',
    },
  }[activeColor];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${c.border}`}
    >
      {active && <CheckCircle2 size={16} className={`absolute top-2 right-2 ${c.check}`} />}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
        <span className={c.iconText}>{icon}</span>
      </div>
      <div className="text-center">
        <p className={`text-sm font-bold ${c.label}`}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

function LocationWidget({ status, latitude, longitude, errorMsg, retry }: LocationState) {
  if (status === 'requesting' || status === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3">
        <Loader2 size={18} className="animate-spin shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-600">Mendapatkan lokasi…</p>
          <p className="text-xs text-blue-400 mt-0.5">
            {status === 'requesting' ? 'Izinkan akses lokasi di browser Anda' : 'Menghitung koordinat GPS…'}
          </p>
        </div>
      </div>
    );
  }
  if (status === 'success' && latitude !== undefined && longitude !== undefined) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-green-400 bg-green-50 px-4 py-3">
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-700">Lokasi berhasil didapatkan</p>
          <p className="font-mono text-xs text-green-500 mt-0.5">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
        </div>
        <button type="button" onClick={retry} title="Perbarui" className="text-green-400 hover:text-green-600 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>
    );
  }
  if (status === 'denied') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700">Izin lokasi ditolak</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">Aktifkan izin di ikon 🔒 address bar, lalu klik Coba Lagi.</p>
        </div>
        <button type="button" onClick={retry} className="shrink-0 rounded-xl bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-colors">Coba Lagi</button>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-600">Gagal mendapatkan lokasi</p>
          <p className="text-xs text-red-400 mt-0.5">{errorMsg}</p>
        </div>
        <button type="button" onClick={retry} className="shrink-0 rounded-xl bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors">Coba Lagi</button>
      </div>
    );
  }
  // idle
  return (
    <button type="button" onClick={retry} className="flex w-full items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:border-blue-300 hover:text-blue-600">
      <MapPin size={18} />
      <span className="flex-1 text-left">Ambil Lokasi Sekarang</span>
      <span className="text-xs text-gray-400">Opsional</span>
    </button>
  );
}

// ─── Regular signup form (manual email/password) ──────────────────────────────

function RegularSignupForm() {
  const router = useRouter();

  function handleSuccess() {
    const { user } = useAuthStore.getState();
    router.push(user?.userType === 'TUKANG' ? '/tukang-dashboard' : '/dashboard');
  }

  const { register, errors, isSubmitting, submitError, userType, selectUserType, location, onSubmit } =
    useSignupForm(handleSuccess);

  const { mutate: googleLogin,   isLoading: googleLoading,   error: googleError }   =
    useGoogleLoginMutation(handleSuccess);
  const { mutate: facebookLogin, isLoading: facebookLoading, error: facebookError } =
    useFacebookLoginMutation(handleSuccess);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>

      {/* Social Sign-Up */}
      <GoogleLoginButton
        onToken={googleLogin}
        isLoading={googleLoading}
        label="Daftar dengan Google"
      />
      <FacebookLoginButton
        onToken={facebookLogin}
        isLoading={facebookLoading}
        label="Daftar dengan Facebook"
      />

      {(googleError || facebookError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{googleError || facebookError}</p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">atau daftar manual</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <UserTypeSelector
        value={userType}
        onSelect={selectUserType}
        error={errors.userType ? 'Pilih tipe akun terlebih dahulu' : undefined}
      />

      <Input label="Nama Lengkap" type="text" placeholder="Masukkan nama lengkap"
        icon={<User size={18} />} error={errors.name?.message} autoComplete="name"
        {...register('name')} />

      <Input label="Email" type="email" placeholder="email@contoh.com"
        icon={<Mail size={18} />} error={errors.email?.message} autoComplete="email"
        {...register('email')} />

      <Input label="Nomor HP" type="tel" placeholder="08xxxxxxxxxx"
        icon={<Phone size={18} />} error={errors.phone?.message} autoComplete="tel"
        {...register('phone')} />

      <Input label="Password" type="password" placeholder="Minimal 6 karakter"
        icon={<Lock size={18} />} error={errors.password?.message} autoComplete="new-password"
        {...register('password')} />

      <Input label="Konfirmasi Password" type="password" placeholder="Ulangi password"
        icon={<Lock size={18} />} error={errors.confirmPassword?.message} autoComplete="new-password"
        {...register('confirmPassword')} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Lokasi</label>
          <span className="text-xs text-gray-400">Opsional — untuk tukang terdekat</span>
        </div>
        <LocationWidget {...location} />
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
        Daftar
      </Button>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-blue-500 hover:underline">Masuk di sini</Link>
      </p>
    </form>
  );
}

// ─── Router — memilih form yang tepat ────────────────────────────────────────

/**
 * SignupForm mendeteksi apakah ada data Google pending di sessionStorage.
 * - Ada  → tampilkan GoogleSignupForm (nama/email sudah terisi dari Google)
 * - Tidak → tampilkan RegularSignupForm (manual daftar + tombol Google)
 */
export default function SignupForm() {
  const [mode, setMode] = useState<'loading' | 'oauth' | 'regular'>('loading');

  useEffect(() => {
    const hasPending = !!sessionStorage.getItem(OAUTH_PENDING_KEY);
    setMode(hasPending ? 'oauth' : 'regular');
  }, []);

  if (mode === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (mode === 'oauth') {
    return <OAuthSignupForm />;
  }

  return <RegularSignupForm />;
}
