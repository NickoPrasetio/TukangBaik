import { IAuthRepository, AuthSession } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class FacebookCompleteUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(accessToken: string, userType: string, phone?: string): Promise<AuthResult<AuthSession>> {
    return this.repo.facebookComplete(accessToken, userType, phone);
  }
}
