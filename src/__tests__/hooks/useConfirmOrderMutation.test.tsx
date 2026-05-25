import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { useConfirmOrderMutation } from '@/hooks/useConfirmOrderMutation';
import { useAuthStore } from '@/store/authStore';
import { server } from '../setup/server';
import { MOCK_USER, MOCK_TOKEN } from '../setup/handlers';
import { createTestQueryClient } from '../setup/test-utils';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false }); });
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

describe('useConfirmOrderMutation', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isAdmin: false });
  });

  it('confirms booking and returns CONFIRMED status', async () => {
    const { result } = renderHook(() => useConfirmOrderMutation(), { wrapper });
    act(() => { result.current.mutate('booking-1'); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('CONFIRMED');
  });

  it('fails with error on unknown booking id', async () => {
    const { result } = renderHook(() => useConfirmOrderMutation(), { wrapper });
    act(() => { result.current.mutate('non-existent'); });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('throws when token is missing', async () => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false, isAdmin: false });
    const { result } = renderHook(() => useConfirmOrderMutation(), { wrapper });
    act(() => { result.current.mutate('booking-1'); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('Sesi habis');
  });

  it('handles 409 Conflict when booking already confirmed', async () => {
    server.use(
      rest.patch(`${BASE}/api/bookings/booking-1/confirm`, (_req, res, ctx) =>
        res(ctx.status(409), ctx.json({ error: 'Booking sudah diproses sebelumnya (status: CONFIRMED)' })),
      ),
    );
    const { result } = renderHook(() => useConfirmOrderMutation(), { wrapper });
    act(() => { result.current.mutate('booking-1'); });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('sudah diproses');
  });
});
