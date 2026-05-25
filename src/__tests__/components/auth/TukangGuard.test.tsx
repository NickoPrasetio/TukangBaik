import React from 'react';
import { render, screen } from '@testing-library/react';
import TukangGuard from '@/components/features/auth/TukangGuard';
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

describe('TukangGuard', () => {
  it('redirects to /login when not authenticated', () => {
    render(<TukangGuard><p>Tukang Only</p></TukangGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Tukang Only')).not.toBeInTheDocument();
  });

  it('redirects to /dashboard when authenticated as CUSTOMER', () => {
    useAuthStore.setState({
      user: { ...MOCK_USER, userType: 'CUSTOMER' },
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isAdmin: false,
    });
    render(<TukangGuard><p>Tukang Only</p></TukangGuard>);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    expect(screen.queryByText('Tukang Only')).not.toBeInTheDocument();
  });

  it('renders children when authenticated as TUKANG', () => {
    useAuthStore.setState({
      user: { ...MOCK_USER, userType: 'TUKANG' },
      token: MOCK_TOKEN,
      isAuthenticated: true,
      isAdmin: false,
    });
    render(<TukangGuard><p>Tukang Only</p></TukangGuard>);
    expect(screen.getByText('Tukang Only')).toBeInTheDocument();
  });
});
