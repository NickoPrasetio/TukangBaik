'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api/review.api';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Mengambil ulasan untuk satu tukang.
 * Di-cache per workerId — buka modal tukang yang sama tidak fetch ulang.
 */
export function useReviewsQuery(workerId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byWorker(workerId),
    queryFn:  () => reviewApi.getByWorker(workerId),
    staleTime: 1000 * 60 * 5, // ulasan jarang berubah, cache 5 menit
  });
}
