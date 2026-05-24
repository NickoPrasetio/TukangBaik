'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  MapPin, Calendar, Clock, Wrench,
  CreditCard, ChevronDown, AlertCircle,
  CheckCircle2, Loader2, ArrowLeft, User,
} from 'lucide-react';
import { Worker } from '@/types';
import { INDONESIAN_CITIES, IndonesianCity } from '@/data/indonesian-cities';
import { useAuthStore } from '@/store/authStore';
import { useCreateBookingMutation } from '@/hooks/useCreateBookingMutation';

// Dynamic import — map hanya di client, tidak di server
const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-sm text-gray-400">Memuat peta…</p>
    </div>
  ),
});

interface LatLng { lat: number; lng: number }

interface BookingFormProps {
  worker: Worker;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(price);
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-semibold text-gray-700">{children}</label>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle size={12} /> {msg}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingForm({ worker }: BookingFormProps) {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const mutation = useCreateBookingMutation();

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [address,       setAddress]       = useState('');
  const [selectedCity,  setSelectedCity]  = useState<IndonesianCity | null>(null);
  const [coords,        setCoords]        = useState<LatLng>({ lat: -6.2, lng: 106.816 });
  const [bookingDate,   setBookingDate]   = useState('');
  const [startTime,     setStartTime]     = useState('08:00');
  const [durationDays,  setDurationDays]  = useState(1);
  const [paymentMethod] = useState('CASH');
  const [notes,         setNotes]         = useState('');
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  // Saat kota dipilih → pindah center map ke koordinat kota
  const mapCenter = useMemo(
    () => selectedCity
      ? { lat: selectedCity.latitude, lng: selectedCity.longitude }
      : { lat: -6.2, lng: 106.816 },
    [selectedCity],
  );

  // ─── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!address.trim())      e.address      = 'Alamat wajib diisi';
    if (!selectedCity)        e.city         = 'Pilih kota terlebih dahulu';
    if (!bookingDate)         e.bookingDate  = 'Tanggal booking wajib diisi';
    if (!startTime)           e.startTime    = 'Waktu mulai wajib diisi';
    if (durationDays < 1)     e.durationDays = 'Durasi minimal 1 hari';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate(
      {
        workerId:      worker.id,
        customerName:  user?.name ?? 'Customer',
        address:       address.trim(),
        city:          selectedCity!.name,
        latitude:      coords.lat,
        longitude:     coords.lng,
        bookingDate,
        startTime,
        durationDays,
        paymentMethod,
        notes:         notes.trim() || undefined,
      },
      {
        onSuccess: (booking) => {
          router.push(`/booking/success?id=${booking.id}`);
        },
      },
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-10">

      {/* Worker Info Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 flex-shrink-0">
          {worker.avatar
            ? <img src={worker.avatar} alt={worker.name} className="w-full h-full object-cover" />
            : <span className="flex items-center justify-center w-full h-full text-lg font-bold text-blue-400">
                {worker.name.slice(0, 2).toUpperCase()}
              </span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{worker.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{worker.location}</p>
          <p className="text-blue-600 font-bold text-sm mt-0.5">{formatPrice(worker.pricePerDay)}/hari</p>
        </div>
      </div>

      {/* Nama Customer */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <User size={18} className="text-blue-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Informasi Pemesan</h3>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
          <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
          <span className="text-xs text-gray-400">({user?.email})</span>
        </div>
      </div>

      {/* Alamat & Kota */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <MapPin size={18} className="text-orange-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Lokasi Pekerjaan</h3>
        </div>

        {/* Kota */}
        <div className="flex flex-col gap-1.5 mb-3">
          <FieldLabel>Kota</FieldLabel>
          <div className="relative">
            <select
              value={selectedCity?.name ?? ''}
              onChange={(e) => {
                const city = INDONESIAN_CITIES.find(c => c.name === e.target.value) ?? null;
                setSelectedCity(city);
                if (city) setCoords({ lat: city.latitude, lng: city.longitude });
                setErrors(prev => ({ ...prev, city: '' }));
              }}
              className="w-full appearance-none bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm text-gray-900 focus:outline-none focus:border-orange-400 transition-colors"
            >
              <option value="">-- Pilih Kota --</option>
              {INDONESIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} — {c.province}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <FieldError msg={errors.city} />
        </div>

        {/* Alamat lengkap */}
        <div className="flex flex-col gap-1.5 mb-4">
          <FieldLabel>Alamat Lengkap</FieldLabel>
          <textarea
            rows={2}
            placeholder="Jl. Contoh No. 10, RT 01/RW 02, Kelurahan..."
            value={address}
            onChange={(e) => { setAddress(e.target.value); setErrors(p => ({ ...p, address: '' })); }}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors resize-none"
          />
          <FieldError msg={errors.address} />
        </div>

        {/* Map */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Titik Lokasi di Peta</FieldLabel>
          <MapPicker center={mapCenter} value={coords} onChange={setCoords} />
          <div className="flex gap-3 mt-1">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Latitude</p>
              <p className="font-mono text-xs text-gray-700 font-medium">{coords.lat.toFixed(6)}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Longitude</p>
              <p className="font-mono text-xs text-gray-700 font-medium">{coords.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jadwal */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar size={18} className="text-blue-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Jadwal Pekerjaan</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tanggal */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Tanggal Mulai</FieldLabel>
            <input
              type="date"
              min={getTodayDate()}
              value={bookingDate}
              onChange={(e) => { setBookingDate(e.target.value); setErrors(p => ({ ...p, bookingDate: '' })); }}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-400 transition-colors"
            />
            <FieldError msg={errors.bookingDate} />
          </div>

          {/* Jam Mulai */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Jam Mulai</FieldLabel>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Durasi */}
        <div className="flex flex-col gap-1.5 mt-3">
          <FieldLabel>Durasi Pengerjaan</FieldLabel>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDurationDays(d => Math.max(1, d - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-lg"
            >
              −
            </button>
            <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-center">
              <span className="text-lg font-bold text-gray-900">{durationDays}</span>
              <span className="text-sm text-gray-400 ml-1">{durationDays === 1 ? 'hari' : 'hari'}</span>
            </div>
            <button
              type="button"
              onClick={() => setDurationDays(d => Math.min(30, d + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold text-lg"
            >
              +
            </button>
          </div>
          <FieldError msg={errors.durationDays} />
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
            <CreditCard size={18} className="text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Metode Pembayaran</h3>
        </div>

        <button
          type="button"
          className="w-full flex items-center gap-4 rounded-2xl border-2 border-green-500 bg-green-50 p-4"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
            <span className="text-white text-lg">💵</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-sm">Tunai (Cash)</p>
            <p className="text-xs text-gray-400 mt-0.5">Bayar langsung saat tukang tiba</p>
          </div>
          <CheckCircle2 size={20} className="text-green-500" />
        </button>
      </div>

      {/* Catatan */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <Wrench size={18} className="text-purple-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Catatan Pekerjaan <span className="text-gray-400 font-normal">(opsional)</span></h3>
        </div>
        <textarea
          rows={3}
          placeholder="Jelaskan pekerjaan yang perlu dilakukan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
        />
      </div>

      {/* Summary Harga */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-5">
        <p className="text-blue-100 text-sm mb-3">Ringkasan Biaya</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/80 text-sm">{formatPrice(worker.pricePerDay)} × {durationDays} hari</span>
          <span className="text-white font-bold">{formatPrice(worker.pricePerDay * durationDays)}</span>
        </div>
        <div className="h-px bg-white/20 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-white font-bold">Total</span>
          <span className="text-white text-xl font-black">{formatPrice(worker.pricePerDay * durationDays)}</span>
        </div>
      </div>

      {/* Error global */}
      {mutation.isError && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-500">{(mutation.error as Error)?.message}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white px-5 py-4 font-bold text-base transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
      >
        {mutation.isPending
          ? <><Loader2 size={20} className="animate-spin" /> Memproses…</>
          : <>Konfirmasi Booking</>
        }
      </button>
    </form>
  );
}
