import { LoginUseCase } from '@/domain/auth/usecases/LoginUseCase';
import { IAuthRepository, AuthSession } from '@/domain/auth/IAuthRepository';
import { AuthResult } from '@/domain/auth/AuthError';

function makeRepo(result: AuthResult<AuthSession>): IAuthRepository {
  return {
    login:            jest.fn().mockResolvedValue(result),
    signup:           jest.fn(),
    googleCheck:      jest.fn(),
    googleComplete:   jest.fn(),
    facebookCheck:    jest.fn(),
    facebookComplete: jest.fn(),
    updateProfile:    jest.fn(),
    uploadAvatar:     jest.fn(),
  } as unknown as IAuthRepository;
}

describe('LoginUseCase', () => {
  it('delegates to authRepo.login and returns its result', async () => {
    const session: AuthSession = {
      user:  { id: '1', name: 'Budi', email: 'budi@example.com', role: 'ROLE_USER' },
      token: 'tok',
    };
    const repo    = makeRepo({ success: true, data: session });
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute('budi@example.com', 'password123');

    expect(repo.login).toHaveBeenCalledWith('budi@example.com', 'password123');
    expect(result).toEqual({ success: true, data: session });
  });

  it('propagates failure result from repo', async () => {
    const repo    = makeRepo({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Salah' } });
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute('wrong@email.com', 'wrong');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_CREDENTIALS');
  });
});
