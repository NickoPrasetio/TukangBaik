import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthGuard from '@/components/features/auth/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER, MOCK_TOKEN } from '../../setup/handlers';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

beforeEach(() => {
  mockReplace.mockClear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false });
});

describe('AuthGuard', () => {
  it('redirects to /login when not authenticated', () => {
    render(<AuthGuard><p>Protected</p></AuthGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders children when authenticated as CUSTOMER', () => {
    useAuthStore.setState({
      user: { ...MOCK_USER, userType: 'CUSTOMER' },
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isAdmin: false,
    });
    render(<AuthGuard><p>Protected</p></AuthGuard>);
    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith('/login');
  });

  it('redirects to /tukang-dashboard when user is TUKANG', () => {
    useAuthStore.setState({
      user: { ...MOCK_USER, userType: 'TUKANG' },
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isAdmin: false,
    });
    render(<AuthGuard><p>Protected</p></AuthGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/tukang-dashboard');
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });
});
