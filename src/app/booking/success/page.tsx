'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, MapPin, Home } from 'lucide-react';
import AuthGuard from '@/components/features/auth/AuthGuard';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('id');

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-gray-50 items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">

          {/* Ikon sukses */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Berhasil!</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Permintaan booking kamu telah dikirim. Tukang akan segera menghubungi kamu untuk konfirmasi.
          </p>

          {bookingId && (
            <div className="w-full bg-blue-50 rounded-2xl px-4 py-3 mb-6">
              <p className="text-xs text-blue-400 mb-0.5">ID Booking</p>
              <p className="font-mono text-xs text-blue-700 font-bold break-all">{bookingId}</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white px-5 py-4 font-bold text-sm hover:bg-blue-600 transition-all active:scale-95"
            >
              <Home size={18} />
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
