'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { CreateBookingUseCase } from '@/domain/booking/usecases';
import { CreateBookingPayload } from '@/lib/api/booking.api';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Mutation untuk membuat booking baru.
 * Setelah sukses:
 *   - Invalidate workers list (status tukang berubah BOOKED)
 *   - Invalidate my bookings list
 */
export function useCreateBookingMutation() {
  const token       = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      if (!token) throw new Error('Sesi habis, silakan login kembali');
      const useCase = new CreateBookingUseCase();
      const result  = await useCase.execute(payload, token);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
