'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { bookingApi } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Mutation untuk tukang memulai/mengkonfirmasi order.
 * PENDING → CONFIRMED
 * Setelah sukses, invalidate worker-orders cache agar list terupdate.
 */
export function useConfirmOrderMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!token) throw new Error('Sesi habis, silakan login kembali');
      return bookingApi.confirmOrder(bookingId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.workerOrders });
    },
  });
}
