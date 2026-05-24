'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api/review.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

interface SubmitReviewInput {
  rating:  number;
  comment: string;
}

/**
 * Mutation untuk mengirim ulasan ke tukang tertentu.
 * Setelah berhasil:
 *   - Invalidate reviews cache tukang ini → list ulasan refetch
 *   - Invalidate workers cache → rating tukang di list ikut terupdate
 */
export function useSubmitReviewMutation(workerId: string) {
  const queryClient = useQueryClient();
  const user        = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ rating, comment }: SubmitReviewInput) =>
      reviewApi.create(workerId, user?.name ?? 'Anonim', rating, comment),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byWorker(workerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
    },
  });
}
