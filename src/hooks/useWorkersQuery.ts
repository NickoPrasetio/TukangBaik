'use client';

import { useQuery } from '@tanstack/react-query';
import { workerApi } from '@/lib/api/worker.api';
import { queryKeys } from '@/lib/queryKeys';
import { useWorkerStore } from '@/store/workerStore';

/**
 * Mengambil daftar tukang dari server.
 * Query key menyertakan searchQuery & filterAvailable —
 * setiap kombinasi filter di-cache secara terpisah.
 */
export function useWorkersQuery() {
  const { searchQuery, filterAvailable } = useWorkerStore();

  return useQuery({
    queryKey: queryKeys.workers.list(searchQuery, filterAvailable),
    queryFn:  () =>
      workerApi.getAll(
        searchQuery   || undefined,
        filterAvailable || undefined,
      ),
  });
}
