'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Dibuat sebagai client component karena QueryClientProvider butuh useState.
 * useState memastikan satu QueryClient instance per browser session.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:          1000 * 60 * 2,  // data fresh selama 2 menit
            retry:              2,               // retry 2x sebelum error
            refetchOnWindowFocus: true,          // refetch saat tab kembali aktif
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
