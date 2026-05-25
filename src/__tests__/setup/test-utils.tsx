import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER, MOCK_TOKEN } from './handlers';

// ─── Create fresh QueryClient per test ───────────────────────────────────────

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// ─── Wrapper with all providers ───────────────────────────────────────────────

function AllProviders({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient();
  return (
    <QueryClientProvider client={qc}>
      {children}
    </QueryClientProvider>
  );
}

// ─── Custom render ────────────────────────────────────────────────────────────

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// ─── Auth store helpers ───────────────────────────────────────────────────────

/** Set authenticated state in Zustand store */
export function setAuthenticatedUser(
  role: 'ROLE_USER' | 'ROLE_ADMIN' = 'ROLE_USER',
  userType: 'CUSTOMER' | 'TUKANG' = 'CUSTOMER',
) {
  useAuthStore.setState({
    user:            { ...MOCK_USER, role, userType },
    token:           MOCK_TOKEN,
    isAuthenticated: true,
    isAdmin:         role === 'ROLE_ADMIN',
  });
}

export function clearAuthStore() {
  useAuthStore.setState({
    user: null, token: null, isAuthenticated: false, isAdmin: false,
  });
}

// Re-export everything from RTL for convenience
export * from '@testing-library/react';
export { renderWithProviders as render };
