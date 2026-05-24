import { IAuthRepository, AuthSession } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class GoogleCompleteUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(accessToken: string, userType: string, phone?: string): Promise<AuthResult<AuthSession>> {
    return this.repo.googleComplete(accessToken, userType, phone);
  }
}
