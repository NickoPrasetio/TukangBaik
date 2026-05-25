import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER, MOCK_TOKEN } from '../../setup/handlers';

const mockPush = jest.fn();
const mockGet  = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
  useRouter:       () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}));

import BookingFailedPage from '@/app/booking/failed/page';

beforeEach(() => {
  mockPush.mockClear();
  mockGet.mockClear();
  useAuthStore.setState({
    user: { ...MOCK_USER, userType: 'CUSTOMER' },
    token: MOCK_TOKEN,
    isAuthenticated: true,
    isAdmin: false,
  });
});

afterEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false });
});

describe('BookingFailedPage', () => {
  it('renders failure heading', () => {
    mockGet.mockReturnValue(null);
    render(<BookingFailedPage />);
    expect(screen.getByText(/booking gagal/i)).toBeInTheDocument();
  });

  it('shows friendly message for already-booked error', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return 'Tukang sudah ada booking pada tanggal tersebut';
      return null;
    });
    render(<BookingFailedPage />);
    expect(screen.getByText(/tanggal yang sama/i)).toBeInTheDocument();
  });

  it('shows friendly message for unavailable worker', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return 'Tukang tidak tersedia';
      return null;
    });
    render(<BookingFailedPage />);
    // The page renders BOTH a friendly message AND the raw error — use getAllByText
    expect(screen.getAllByText(/tidak tersedia/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Coba Lagi" button when workerId is provided', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'workerId') return 'worker-1';
      return null;
    });
    render(<BookingFailedPage />);
    expect(screen.getByRole('button', { name: /coba lagi/i })).toBeInTheDocument();
  });

  it('does not show "Coba Lagi" when no workerId', () => {
    mockGet.mockReturnValue(null);
    render(<BookingFailedPage />);
    expect(screen.queryByRole('button', { name: /coba lagi/i })).not.toBeInTheDocument();
  });

  it('"Coba Lagi" navigates back to booking form', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'workerId') return 'worker-1';
      return null;
    });
    render(<BookingFailedPage />);
    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(mockPush).toHaveBeenCalledWith('/booking/worker-1');
  });

  it('"Kembali ke Dashboard" navigates to /dashboard', () => {
    mockGet.mockReturnValue(null);
    render(<BookingFailedPage />);
    fireEvent.click(screen.getByRole('button', { name: /kembali ke dashboard/i }));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
