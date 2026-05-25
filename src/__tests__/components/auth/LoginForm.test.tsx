import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import LoginForm from '@/components/features/auth/LoginForm';
import { useAuthStore } from '@/store/authStore';
import { server } from '../../setup/server';
import { createTestQueryClient } from '../../setup/test-utils';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isAdmin: false }); });
afterAll(() => server.close());

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter:       () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
  usePathname:     () => '/',
}));

function renderLoginForm() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('shows validation error when email is empty on submit', async () => {
    renderLoginForm();
    // Use exact name to distinguish from "Masuk dengan Google/Facebook" buttons
    fireEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), '123');
    fireEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/minimal 6 karakter/i)).toBeInTheDocument();
    });
  });

  it('shows error message on wrong credentials', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByPlaceholderText(/email/i), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'wrongpassword');
    fireEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/password salah/i)).toBeInTheDocument();
    });
  });

  it('sets auth state and redirects on successful login', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByPlaceholderText(/email/i), 'budi@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
    expect(mockPush).toHaveBeenCalled();
  });

  it('shows network error message when API is down', async () => {
    server.use(
      rest.post(`${BASE}/api/auth/login`, (_req, res) => res.networkError('Connection refused')),
    );
    const user = userEvent.setup();
    renderLoginForm();
    await user.type(screen.getByPlaceholderText(/email/i), 'budi@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    await waitFor(() => {
      expect(screen.getByText(/internet/i)).toBeInTheDocument();
    });
  });
});
