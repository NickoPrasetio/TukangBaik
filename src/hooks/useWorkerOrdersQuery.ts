'use client';

import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

/**
 * Mengambil daftar order yang masuk ke tukang yang sedang login.
 * Hanya aktif jika user sudah terautentikasi.
 */
export function useWorkerOrdersQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: queryKeys.bookings.workerOrders,
    queryFn:  () => bookingApi.getWorkerOrders(token!),
    enabled:  !!token,
  });
}
