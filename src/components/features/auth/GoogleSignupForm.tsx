'use client';

import Image from 'next/image';
import {
  Phone, HardHat, ShoppingBag, CheckCircle2,
  AlertCircle, Loader2, Mail, User,
} from 'lucide-react';
import { useGoogleSignupForm } from '@/hooks/useGoogleSignupForm';
import { UserType } from '@/lib/schemas/auth.schema';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// ─── TypeCard (reuse pattern dari SignupForm) ─────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Form penyelesaian registrasi untuk pengguna baru via Google.
 * - Nama & email diambil dari Google (read-only, tidak bisa diubah)
 * - Pengguna hanya perlu memilih tipe akun (CUSTOMER / TUKANG)
 * - Nomor HP opsional
 */
export default function GoogleSignupForm() {
  const {
    pending,
    register,
    errors,
    isSubmitting,
    submitError,
    userType,
    selectUserType,
    onSubmit,
  } = useGoogleSignupForm();

  // Selama data pending belum dimuat dari sessionStorage, tampilkan skeleton
  if (!pending) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 size={28} className="animate-spin text-orange-400" />
        <p className="text-sm text-gray-400">Memuat data Google…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>

      {/* Google identity badge */}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3">
        {pending.avatar ? (
          <Image
            src={pending.avatar}
            alt={pending.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center shrink-0">
            <User size={20} className="text-green-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-green-800 truncate">{pending.name}</p>
          <p className="text-xs text-green-600 truncate">{pending.email}</p>
        </div>
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
      </div>

      {/* Info readonly */}
      <p className="text-xs text-gray-400 text-center -mt-1">
        Nama dan email diambil dari akun Google Anda dan tidak dapat diubah.
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
        value={pending.email}
        readOnly
        disabled
        icon={<Mail size={18} />}
        className="bg-gray-50 text-gray-500 cursor-not-allowed"
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
