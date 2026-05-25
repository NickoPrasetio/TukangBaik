'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

/**
 * Customer menandai order sebagai selesai: CONFIRMED → COMPLETED.
 * Setelah sukses, cache daftar order customer di-invalidate.
 */
export function useCompleteOrderMutation() {
  const queryClient = useQueryClient();
  const token       = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (orderId: string) => bookingApi.completeOrder(orderId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
