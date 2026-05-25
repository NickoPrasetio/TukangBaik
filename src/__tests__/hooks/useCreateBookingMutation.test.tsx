import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { useCreateBookingMutation } from '@/hooks/useCreateBookingMutation';
import { useAuthStore } from '@/store/authStore';
import { server } from '../setup/server';
import { MOCK_BOOKING, MOCK_USER, MOCK_TOKEN } from '../setup/handlers';
import { createTestQueryClient } from '../setup/test-utils';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false }); });
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

describe('useCreateBookingMutation', () => {
  const payload = {
    workerId: 'worker-1', customerName: 'Budi', address: 'Jl. Test',
    city: 'Jakarta', latitude: -6.2, longitude: 106.8,
    bookingDate: '2026-05-25', startTime: '08:00', durationDays: 1, paymentMethod: 'CASH',
  };

  beforeEach(() => {
    useAuthStore.setState({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isAdmin: false });
  });

  it('returns booking data on success', async () => {
    const { result } = renderHook(() => useCreateBookingMutation(), { wrapper });
    act(() => { result.current.mutate(payload); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(MOCK_BOOKING.id);
  });

  it('throws error when token is null', async () => {
    useAuthStore.setState({ token: null, isAuthenticated: false, user: null, isAdmin: false });
    const { result } = renderHook(() => useCreateBookingMutation(), { wrapper });
    act(() => { result.current.mutate(payload); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Sesi habis');
  });

  it('throws error on API failure (409 conflict)', async () => {
    server.use(
      rest.post(`${BASE}/api/bookings`, (_req, res, ctx) =>
        res(ctx.status(409), ctx.json({ error: 'Tukang sudah ada booking pada tanggal tersebut' })),
      ),
    );
    const { result } = renderHook(() => useCreateBookingMutation(), { wrapper });
    act(() => { result.current.mutate(payload); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('sudah ada booking');
  });
});
