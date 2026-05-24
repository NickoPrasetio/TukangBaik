'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Lock, Phone, MapPin, HardHat,
  ShoppingBag, CheckCircle2, AlertCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type UserType = 'CUSTOMER' | 'TUKANG';
type LocationStatus = 'idle' | 'requesting' | 'loading' | 'success' | 'denied' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  userType?: string;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export default function SignupForm() {
  const router = useRouter();
  const { signup } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [userType, setUserType] = useState<UserType | null>(null);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ─── Auto-request GPS on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    // Check current permission state first (Permissions API)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Already granted → silently fetch
          fetchLocation();
        } else if (result.state === 'prompt') {
          // Will prompt → show "requesting" state then ask
          setLocationStatus('requesting');
          fetchLocation();
        } else {
          // 'denied' → show denied state
          setLocationStatus('denied');
          setLocationError('Izin lokasi ditolak. Aktifkan di pengaturan browser.');
        }

        // Listen for permission change (user changes it mid-session)
        result.onchange = () => {
          if (result.state === 'granted') fetchLocation();
          else if (result.state === 'denied') {
            setLocationStatus('denied');
            setLocationError('Izin lokasi ditolak. Aktifkan di pengaturan browser.');
          }
        };
      });
    } else {
      // Browsers without Permissions API (older) → just request directly
      setLocationStatus('requesting');
      fetchLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fetchLocation() {
    setLocationStatus('loading');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationStatus('success');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationError('Izin lokasi ditolak. Aktifkan di pengaturan browser.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationStatus('error');
          setLocationError('Sinyal GPS tidak tersedia. Coba di tempat terbuka.');
        } else if (err.code === err.TIMEOUT) {
          setLocationStatus('error');
          setLocationError('Timeout. Pastikan GPS aktif dan coba lagi.');
        } else {
          setLocationStatus('error');
          setLocationError('Gagal mendapatkan lokasi.');
        }
      },
      GEO_OPTIONS,
    );
  }

  function handleRetryLocation() {
    fetchLocation();
  }

  // ─── Form helpers ─────────────────────────────────────────────────────────────
  function setField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleUserTypeSelect(type: UserType) {
    setUserType(type);
    if (errors.userType) setErrors((prev) => ({ ...prev, userType: undefined }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!form.email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';
    if (!form.phone) newErrors.phone = 'Nomor HP wajib diisi';
    else if (!/^08\d{8,11}$/.test(form.phone)) newErrors.phone = 'Format: 08xxxxxxxxxx';
    if (!form.password) newErrors.password = 'Password wajib diisi';
    else if (form.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Password tidak sama';
    if (!userType) newErrors.userType = 'Pilih tipe akun terlebih dahulu';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const ok = await signup(form.name, form.email, form.password, form.phone, userType!, latitude, longitude);
    setLoading(false);
    if (ok) router.push('/dashboard');
  }

  // ─── Location widget ──────────────────────────────────────────────────────────
  function LocationWidget() {
    // No geolocation support
    if (!('geolocation' in navigator)) {
      return (
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
          <MapPin size={16} />
          <span>Browser tidak mendukung GPS</span>
        </div>
      );
    }

    if (locationStatus === 'requesting' || locationStatus === 'loading') {
      return (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-600">
          <Loader2 size={18} className="animate-spin shrink-0" />
          <div>
            <p className="font-medium">Mendapatkan lokasi…</p>
            <p className="text-xs text-blue-400 mt-0.5">
              {locationStatus === 'requesting' ? 'Izinkan akses lokasi di browser Anda' : 'Menghitung koordinat GPS…'}
            </p>
          </div>
        </div>
      );
    }

    if (locationStatus === 'success' && latitude !== undefined && longitude !== undefined) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-green-400 bg-green-50 px-4 py-3 text-sm">
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-700">Lokasi berhasil didapatkan</p>
            <p className="text-xs text-green-500 mt-0.5 font-mono">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetryLocation}
            title="Perbarui lokasi"
            className="text-green-400 hover:text-green-600 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      );
    }

    if (locationStatus === 'denied') {
      return (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-700">Izin lokasi ditolak</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              Aktifkan izin lokasi di ikon kunci (🔒) pada address bar browser, lalu klik Coba Lagi.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetryLocation}
            className="shrink-0 rounded-xl bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    if (locationStatus === 'error') {
      return (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-600">Gagal mendapatkan lokasi</p>
            <p className="text-xs text-red-400 mt-0.5">{locationError}</p>
          </div>
          <button
            type="button"
            onClick={handleRetryLocation}
            className="shrink-0 rounded-xl bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    // idle fallback (shouldn't normally show, but just in case)
    return (
      <button
        type="button"
        onClick={handleRetryLocation}
        className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all w-full"
      >
        <MapPin size={18} />
        <span className="flex-1 text-left">Ambil Lokasi Sekarang</span>
        <span className="text-xs text-gray-400">Opsional</span>
      </button>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

      {/* User Type Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">Tipe Akun</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleUserTypeSelect('CUSTOMER')}
            className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
              userType === 'CUSTOMER'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            {userType === 'CUSTOMER' && (
              <CheckCircle2 size={16} className="absolute top-2 right-2 text-blue-500" />
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              userType === 'CUSTOMER' ? 'bg-blue-500' : 'bg-gray-100'
            }`}>
              <ShoppingBag size={20} className={userType === 'CUSTOMER' ? 'text-white' : 'text-gray-500'} />
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${userType === 'CUSTOMER' ? 'text-blue-600' : 'text-gray-700'}`}>
                Customer
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Cari & booking tukang</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleUserTypeSelect('TUKANG')}
            className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
              userType === 'TUKANG'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            {userType === 'TUKANG' && (
              <CheckCircle2 size={16} className="absolute top-2 right-2 text-orange-500" />
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              userType === 'TUKANG' ? 'bg-orange-500' : 'bg-gray-100'
            }`}>
              <HardHat size={20} className={userType === 'TUKANG' ? 'text-white' : 'text-gray-500'} />
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold ${userType === 'TUKANG' ? 'text-orange-600' : 'text-gray-700'}`}>
                Tukang
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Tawarkan jasa Anda</p>
            </div>
          </button>
        </div>
        {errors.userType && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.userType}
          </p>
        )}
      </div>

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="Masukkan nama lengkap"
        icon={<User size={18} />}
        value={form.name}
        onChange={(e) => setField('name', e.target.value)}
        error={errors.name}
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        placeholder="email@contoh.com"
        icon={<Mail size={18} />}
        value={form.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Nomor HP"
        type="tel"
        placeholder="08xxxxxxxxxx"
        icon={<Phone size={18} />}
        value={form.phone}
        onChange={(e) => setField('phone', e.target.value)}
        error={errors.phone}
        autoComplete="tel"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Minimal 6 karakter"
        icon={<Lock size={18} />}
        value={form.password}
        onChange={(e) => setField('password', e.target.value)}
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        label="Konfirmasi Password"
        type="password"
        placeholder="Ulangi password"
        icon={<Lock size={18} />}
        value={form.confirmPassword}
        onChange={(e) => setField('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Lokasi</label>
          <span className="text-xs text-gray-400">Opsional — untuk tukang terdekat</span>
        </div>
        <LocationWidget />
      </div>

      <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
        Daftar
      </Button>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-blue-500 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
