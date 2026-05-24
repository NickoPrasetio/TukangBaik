'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Worker } from '@/types';
import { workerApi } from '@/lib/api/worker.api';
import AuthGuard from '@/components/features/auth/AuthGuard';
import BookingForm from '@/components/features/booking/BookingForm';

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.workerId as string;

  const [worker,  setWorker]  = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    workerApi.getById(workerId)
      .then(setWorker)
      .catch(() => setError('Tukang tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [workerId]);

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-dvh bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base">Detail Booking</h1>
            <p className="text-xs text-gray-400">Isi data untuk konfirmasi</p>
          </div>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <div className="m-4 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-4">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {worker && !loading && (
          <div className="flex-1 pt-4">
            <BookingForm worker={worker} />
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
