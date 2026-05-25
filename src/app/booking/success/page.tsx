'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Home } from 'lucide-react';
import AuthGuard from '@/components/features/auth/AuthGuard';

const COUNTDOWN = 5;

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('id');

  const [seconds, setSeconds] = useState(COUNTDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router]);

  const progress = ((COUNTDOWN - seconds) / COUNTDOWN) * 100;

  return (
    <main className="flex flex-col min-h-dvh bg-gray-50 items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">

        {/* Ikon sukses dengan animasi */}
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Booking Berhasil!</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Permintaan booking kamu telah dikirim.
          Tukang akan segera menghubungi kamu untuk konfirmasi.
        </p>

        {bookingId && (
          <div className="w-full bg-blue-50 rounded-2xl px-4 py-3 mb-6">
            <p className="text-xs text-blue-400 mb-0.5">ID Booking</p>
            <p className="font-mono text-xs text-blue-700 font-bold break-all">{bookingId}</p>
          </div>
        )}

        {/* Countdown progress bar */}
        <div className="w-full mb-4">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Menuju dashboard dalam <span className="font-bold text-green-500">{seconds}</span> detik…
          </p>
        </div>

        {/* Manual redirect button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-500 text-white px-5 py-4 font-bold text-sm hover:bg-green-600 transition-all active:scale-95"
        >
          <Home size={18} />
          Ke Dashboard Sekarang
        </button>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <AuthGuard>
      <BookingSuccessContent />
    </AuthGuard>
  );
}
