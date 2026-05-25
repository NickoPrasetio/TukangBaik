import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { useWorkerOrdersQuery } from '@/hooks/useWorkerOrdersQuery';
import { useAuthStore } from '@/store/authStore';
import { server } from '../setup/server';
import { MOCK_USER, MOCK_TOKEN, MOCK_BOOKING } from '../setup/handlers';
import { createTestQueryClient } from '../setup/test-utils';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false }); });
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

describe('useWorkerOrdersQuery', () => {
  it('is disabled when token is null', () => {
    const { result } = renderHook(() => useWorkerOrdersQuery(), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('fetches worker orders when authenticated', async () => {
    useAuthStore.setState({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isAdmin: false });
    const { result } = renderHook(() => useWorkerOrdersQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe(MOCK_BOOKING.id);
  });

  it('handles API error gracefully', async () => {
    useAuthStore.setState({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isAdmin: false });
    server.use(
      rest.get(`${BASE}/api/bookings/my-orders`, (_req, res, ctx) =>
        res(ctx.status(404), ctx.json({ error: 'Profil tukang tidak ditemukan' })),
      ),
    );
    const { result } = renderHook(() => useWorkerOrdersQuery(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
