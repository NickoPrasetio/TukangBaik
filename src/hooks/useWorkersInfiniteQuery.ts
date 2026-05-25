'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { workerApi } from '@/lib/api/worker.api';
import { queryKeys } from '@/lib/queryKeys';
import { useWorkerStore } from '@/store/workerStore';

const PAGE_SIZE = 10;

/**
 * Infinite-scroll version — load 10 tukang per page.
 * Query key includes searchQuery & filterAvailable so filter
 * changes automatically reset back to page 0.
 */
export function useWorkersInfiniteQuery() {
  const { searchQuery, filterAvailable } = useWorkerStore();

  return useInfiniteQuery({
    queryKey:         queryKeys.workers.infinite(searchQuery, filterAvailable),
    queryFn:          ({ pageParam }) =>
      workerApi.getPage(
        pageParam,
        PAGE_SIZE,
        searchQuery   || undefined,
        filterAvailable || undefined,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });
}
