import { rest } from 'msw';
import { server } from '../../setup/server';
import { AuthRepository } from '@/data/auth/AuthRepository';

const BASE = 'http://localhost:8080';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const repo = new AuthRepository();

describe('AuthRepository.login', () => {
  it('returns success session on 200', async () => {
    const result = await repo.login('budi@example.com', 'password123');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.user.email).toBe('budi@example.com');
      expect(result.data.token).toBe('mock-jwt-token');
    }
  });

  it('maps 401 to INVALID_CREDENTIALS error', async () => {
    const result = await repo.login('wrong@example.com', 'bad');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('maps network error to NETWORK_ERROR', async () => {
    server.use(
      rest.post(`${BASE}/api/auth/login`, (_req, res) => res.networkError('Connection refused')),
    );
    const result = await repo.login('a@b.com', 'pass');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('NETWORK_ERROR');
  });
});

describe('AuthRepository.signup', () => {
  it('returns success on valid registration', async () => {
    const result = await repo.signup({
      name: 'Budi', email: 'newuser@example.com',
      password: 'password123', phone: '081234567890', userType: 'CUSTOMER',
    });
    expect(result.success).toBe(true);
  });

  it('maps duplicate email to EMAIL_TAKEN error', async () => {
    const result = await repo.signup({
      name: 'Budi', email: 'taken@example.com',
      password: 'password123', phone: '081234567890', userType: 'CUSTOMER',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('EMAIL_TAKEN');
  });
});

describe('AuthRepository.googleCheck', () => {
  it('returns isNewUser=false with session for existing user', async () => {
    const result = await repo.googleCheck('existing-google-token');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isNewUser).toBe(false);
      if (!result.data.isNewUser) expect(result.data.session.token).toBe('mock-jwt-token');
    }
  });

  it('returns isNewUser=true with name/email for new user', async () => {
    const result = await repo.googleCheck('new-google-token');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isNewUser).toBe(true);
      if (result.data.isNewUser) {
        expect(result.data.name).toBe('Google User');
        expect(result.data.email).toBe('google@example.com');
      }
    }
  });
});
