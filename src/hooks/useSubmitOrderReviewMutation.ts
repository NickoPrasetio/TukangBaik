'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api/review.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

export interface OrderReviewPayload {
  workerId:  string;
  bookingId: string;
  rating:    number;
  comment:   string;
  photos:    File[];
}

/**
 * Submit review customer untuk sebuah order, dengan opsional upload foto (max 5).
 * Setelah sukses, cache reviews worker & daftar order di-invalidate.
 */
export function useSubmitOrderReviewMutation() {
  const queryClient = useQueryClient();
  const token       = useAuthStore((s) => s.token);
  const userName    = useAuthStore((s) => s.user?.name ?? '');

  return useMutation({
    mutationFn: ({ workerId, bookingId, rating, comment, photos }: OrderReviewPayload) =>
      reviewApi.createWithPhotos(workerId, bookingId, userName, rating, comment, photos, token!),
    onSuccess: (_, { workerId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byWorker(workerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my });
    },
  });
}
