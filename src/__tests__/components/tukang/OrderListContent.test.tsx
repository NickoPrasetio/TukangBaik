import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import OrderListContent from '@/components/features/tukang-dashboard/OrderListContent';
import { useAuthStore } from '@/store/authStore';
import { server } from '../../setup/server';
import { MOCK_USER, MOCK_TOKEN, MOCK_BOOKING } from '../../setup/handlers';
import { createTestQueryClient } from '../../setup/test-utils';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false }); });
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

function renderComponent() {
  return render(<OrderListContent />, { wrapper });
}

describe('OrderListContent', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isAdmin: false });
  });

  it('shows loading state initially', () => {
    renderComponent();
    expect(screen.getByText(/memuat order/i)).toBeInTheDocument();
  });

  it('shows order customer name after data loads', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(MOCK_BOOKING.customerName)).toBeInTheDocument();
    });
  });

  it('shows order count summary', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/1 order/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no orders', async () => {
    server.use(
      rest.get(`${BASE}/api/bookings/my-orders`, (_req, res, ctx) =>
        res(ctx.json([])),
      ),
    );
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/belum ada order masuk/i)).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    server.use(
      rest.get(`${BASE}/api/bookings/my-orders`, (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: 'Server Error' })),
      ),
    );
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/gagal memuat order/i)).toBeInTheDocument();
    });
  });

  it('opens detail modal when order card is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(MOCK_BOOKING.customerName)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(MOCK_BOOKING.customerName));
    await waitFor(() => {
      expect(screen.getByText('Detail Order')).toBeInTheDocument();
    });
  });
});
