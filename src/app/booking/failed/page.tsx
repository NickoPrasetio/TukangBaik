'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import AuthGuard from '@/components/features/auth/AuthGuard';

function BookingFailedContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const workerId   = searchParams.get('workerId');
  const errorMsg   = searchParams.get('error') ?? 'Terjadi kesalahan saat memproses booking.';

  // Pesan error yang lebih ramah
  const friendlyError = (() => {
    if (errorMsg.includes('sudah ada booking')) return 'Tukang ini sudah dibooking pada tanggal yang sama. Pilih tanggal lain atau tukang lain.';
    if (errorMsg.includes('tidak tersedia') || errorMsg.includes('BOOKED')) return 'Tukang sedang tidak tersedia untuk dibooking saat ini.';
    if (errorMsg.includes('tidak ditemukan')) return 'Tukang tidak ditemukan. Mungkin profil sudah dihapus.';
    if (errorMsg.includes('Sesi habis') || errorMsg.includes('401')) return 'Sesi login habis. Silakan login kembali.';
    return errorMsg;
  })();

  return (
    <main className="flex flex-col min-h-dvh bg-gray-50 items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">

        {/* Ikon gagal */}
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Gagal</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {friendlyError}
        </p>

        {/* Detail error (untuk debugging) */}
        {errorMsg !== friendlyError && (
          <div className="w-full bg-red-50 rounded-2xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-red-400 mb-0.5">Detail Error</p>
            <p className="text-xs text-red-600 break-words">{errorMsg}</p>
          </div>
        )}

        <div className="w-full flex flex-col gap-3">
          {/* Coba lagi — kembali ke form booking tukang yang sama */}
          {workerId && (
            <button
              onClick={() => router.push(`/booking/${workerId}`)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 text-white px-5 py-4 font-bold text-sm hover:bg-blue-600 transition-all active:scale-95"
            >
              <RefreshCw size={18} />
              Coba Lagi
            </button>
          )}

          {/* Kembali ke dashboard */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-100 text-gray-700 px-5 py-4 font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
          >
            <Home size={18} />
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

export default function BookingFailedPage() {
  return (
    <AuthGuard>
      <BookingFailedContent />
    </AuthGuard>
  );
}
