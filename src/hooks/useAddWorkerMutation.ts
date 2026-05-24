'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workerApi, WorkerCreatePayload } from '@/lib/api/worker.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';

interface AddWorkerInput {
  data:  WorkerCreatePayload;
  photo: File | null;
}

/**
 * Mutation untuk admin menambah tukang baru.
 * Setelah berhasil: invalidate semua workers query → list otomatis refetch.
 */
export function useAddWorkerMutation() {
  const queryClient = useQueryClient();
  const token       = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: async ({ data, photo }: AddWorkerInput) => {
      const worker = await workerApi.create(data, token!);
      if (photo) await workerApi.uploadPhoto(worker.id, photo, token!);
      return worker;
    },
    onSuccess: () => {
      // Invalidate seluruh workers cache — list akan refetch otomatis
      queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
    },
  });
}
