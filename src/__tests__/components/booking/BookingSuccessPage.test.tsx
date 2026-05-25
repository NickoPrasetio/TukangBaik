import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER, MOCK_TOKEN } from '../../setup/handlers';

// Mock the success page inner content (since it uses useSearchParams)
const mockGet = jest.fn().mockReturnValue('booking-1');
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
  useRouter:       () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}));

// Import after mocks
import BookingSuccessPage from '@/app/booking/success/page';

beforeEach(() => {
  jest.useFakeTimers();
  useAuthStore.setState({
    user: { ...MOCK_USER, userType: 'CUSTOMER' },
    token: MOCK_TOKEN,
    isAuthenticated: true,
    isAdmin: false,
  });
});

afterEach(() => {
  jest.useRealTimers();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false });
});

describe('BookingSuccessPage', () => {
  it('renders success heading', () => {
    render(<BookingSuccessPage />);
    expect(screen.getByText(/booking berhasil/i)).toBeInTheDocument();
  });

  it('displays booking ID', () => {
    render(<BookingSuccessPage />);
    expect(screen.getByText('booking-1')).toBeInTheDocument();
  });

  it('shows countdown at 5 initially', () => {
    render(<BookingSuccessPage />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('counts down to 4 after 1 second', () => {
    render(<BookingSuccessPage />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows "Ke Dashboard Sekarang" button', () => {
    render(<BookingSuccessPage />);
    expect(screen.getByRole('button', { name: /ke dashboard sekarang/i })).toBeInTheDocument();
  });
});
