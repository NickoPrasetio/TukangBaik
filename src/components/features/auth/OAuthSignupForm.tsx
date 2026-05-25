'use client';

import Image from 'next/image';
import {
  Phone, HardHat, ShoppingBag, CheckCircle2,
  AlertCircle, Loader2, Mail, User,
} from 'lucide-react';
import { useOAuthSignupForm } from '@/hooks/useOAuthSignupForm';
import { UserType } from '@/lib/schemas/auth.schema';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ─── TypeCard ─────────────────────────────────────────────────────────────────

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

// ─── Provider badge icons ─────────────────────────────────────────────────────

function GoogleBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Form penyelesaian registrasi untuk pengguna baru via OAuth (Google atau Facebook).
 * - Nama & email diambil dari provider (read-only)
 * - Pengguna hanya perlu memilih tipe akun dan opsional nomor HP
 */
export default function OAuthSignupForm() {
  const {
    pending,
    register,
    errors,
    isSubmitting,
    submitError,
    userType,
    selectUserType,
    onSubmit,
  } = useOAuthSignupForm();

  if (!pending) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 size={28} className="animate-spin text-orange-400" />
        <p className="text-sm text-gray-400">Memuat data akun…</p>
      </div>
    );
  }

  const isGoogle   = pending.provider === 'google';
  const providerLabel = isGoogle ? 'Google' : 'Facebook';
  const badgeColor    = isGoogle
    ? 'border-blue-200 bg-blue-50'
    : 'border-blue-300 bg-blue-50';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>

      {/* Provider identity badge */}
      <div className={`flex items-center gap-3 rounded-2xl border-2 ${badgeColor} px-4 py-3`}>
        {pending.avatar ? (
          <Image
            src={pending.avatar}
            alt={pending.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User size={20} className="text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{pending.name}</p>
          <p className="text-xs text-gray-500 truncate">{pending.email || 'Email tidak tersedia'}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-1">
          {isGoogle ? <GoogleBadge /> : <FacebookBadge />}
          <span className="text-xs font-medium text-gray-600">{providerLabel}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center -mt-1">
        Nama dan email diambil dari akun {providerLabel} Anda dan tidak dapat diubah.
      </p>

      {/* Readonly name */}
      <Input
        label="Nama Lengkap"
        type="text"
        value={pending.name}
        readOnly
        disabled
        icon={<User size={18} />}
        className="bg-gray-50 text-gray-500 cursor-not-allowed"
      />

      {/* Readonly email */}
      <Input
        label="Email"
        type="email"
        value={pending.email || ''}
        readOnly
        disabled
        icon={<Mail size={18} />}
        className="bg-gray-50 text-gray-500 cursor-not-allowed"
        placeholder="Tidak tersedia dari akun ini"
      />

      {/* UserType selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">Tipe Akun</label>
        <div className="grid grid-cols-2 gap-3">
          <TypeCard
            active={userType === 'CUSTOMER'}
            icon={<ShoppingBag size={20} />}
            label="Customer"
            description="Cari & booking tukang"
            activeColor="blue"
            onClick={() => selectUserType('CUSTOMER' as UserType)}
          />
          <TypeCard
            active={userType === 'TUKANG'}
            icon={<HardHat size={20} />}
            label="Tukang"
            description="Tawarkan jasa Anda"
            activeColor="orange"
            onClick={() => selectUserType('TUKANG' as UserType)}
          />
        </div>
        {errors.userType && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={12} /> {errors.userType.message}
          </p>
        )}
      </div>

      {/* Phone (optional) */}
      <Input
        label="Nomor HP"
        type="tel"
        placeholder="08xxxxxxxxxx (opsional)"
        icon={<Phone size={18} />}
        error={errors.phone?.message}
        autoComplete="tel"
        {...register('phone')}
      />
      <p className="text-xs text-gray-400 -mt-2">Nomor HP opsional, bisa dilengkapi nanti.</p>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
        Selesaikan Pendaftaran
      </Button>

    </form>
  );
}
