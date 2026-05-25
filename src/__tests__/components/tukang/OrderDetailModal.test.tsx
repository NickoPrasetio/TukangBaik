import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import OrderDetailModal from '@/components/features/tukang-dashboard/OrderDetailModal';
import { useAuthStore } from '@/store/authStore';
import { server } from '../../setup/server';
import { MOCK_USER, MOCK_TOKEN, MOCK_BOOKING } from '../../setup/handlers';
import { createTestQueryClient } from '../../setup/test-utils';
import { Booking } from '@/types';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); jest.clearAllMocks(); useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false }); });
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

const pendingOrder: Booking = { ...MOCK_BOOKING, status: 'PENDING' };
const confirmedOrder: Booking = { ...MOCK_BOOKING, status: 'CONFIRMED' };
const mockOnClose = jest.fn();

function renderModal(order: Booking = pendingOrder) {
  return render(<OrderDetailModal order={order} onClose={mockOnClose} />, { wrapper });
}

describe('OrderDetailModal', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: MOCK_USER, token: MOCK_TOKEN, isAuthenticated: true, isAdmin: false });
  });

  it('renders customer name', () => {
    renderModal();
    expect(screen.getByText(MOCK_BOOKING.customerName)).toBeInTheDocument();
  });

  it('renders address and city', () => {
    renderModal();
    expect(screen.getByText(new RegExp(MOCK_BOOKING.city))).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    renderModal();
    expect(screen.getByText(MOCK_BOOKING.notes!)).toBeInTheDocument();
  });

  it('shows "Mulai Proses Order" button for PENDING order', () => {
    renderModal(pendingOrder);
    expect(screen.getByRole('button', { name: /mulai proses order/i })).toBeInTheDocument();
  });

  it('does NOT show "Mulai Proses Order" button for CONFIRMED order', () => {
    renderModal(confirmedOrder);
    expect(screen.queryByRole('button', { name: /mulai proses order/i })).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = renderModal();
    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows date mismatch popup when server date differs from booking date', async () => {
    server.use(
      rest.get(`${BASE}/api/bookings/server-time`, (_req, res, ctx) =>
        res(ctx.json({ date: '2026-06-01', dateTime: '2026-06-01T08:00:00' })),
      ),
    );
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation((success) =>
      success({ coords: { latitude: -6.2, longitude: 106.816 } }),
    );

    renderModal({ ...pendingOrder, bookingDate: '2026-05-25' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /mulai proses order/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/tanggal tidak sesuai/i)).toBeInTheDocument();
    });
  });

  it('shows GPS out-of-range popup when distance > 1km', async () => {
    server.use(
      rest.get(`${BASE}/api/bookings/server-time`, (_req, res, ctx) =>
        res(ctx.json({ date: MOCK_BOOKING.bookingDate, dateTime: '2026-05-25T08:00:00' })),
      ),
    );
    // GPS far from order location — this is ~100km away
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation((success) =>
      success({ coords: { latitude: -7.5, longitude: 110.0 } }),
    );

    renderModal(pendingOrder);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /mulai proses order/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/terlalu jauh/i)).toBeInTheDocument();
    });
  });

  it('shows GPS error popup when geolocation is denied', async () => {
    server.use(
      rest.get(`${BASE}/api/bookings/server-time`, (_req, res, ctx) =>
        res(ctx.json({ date: MOCK_BOOKING.bookingDate, dateTime: '2026-05-25T08:00:00' })),
      ),
    );
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(
      (_success, error) => error({ code: 1, message: 'User denied' }),
    );

    renderModal(pendingOrder);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /mulai proses order/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/gps tidak tersedia/i)).toBeInTheDocument();
    });
  });

  it('shows success popup and closes modal when validation passes', async () => {
    server.use(
      rest.get(`${BASE}/api/bookings/server-time`, (_req, res, ctx) =>
        res(ctx.json({ date: MOCK_BOOKING.bookingDate, dateTime: '2026-05-25T08:00:00' })),
      ),
    );
    // GPS exactly at order location → 0 distance → within 1km
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation((success) =>
      success({ coords: { latitude: MOCK_BOOKING.latitude, longitude: MOCK_BOOKING.longitude } }),
    );

    renderModal(pendingOrder);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /mulai proses order/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/order dimulai/i)).toBeInTheDocument();
    });

    // Click "Mengerti" on success popup — should close modal
    fireEvent.click(screen.getByRole('button', { name: /mengerti/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
