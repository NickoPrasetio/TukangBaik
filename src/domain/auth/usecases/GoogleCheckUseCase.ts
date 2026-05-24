import { IAuthRepository, GoogleCheckResult } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class GoogleCheckUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(accessToken: string): Promise<AuthResult<GoogleCheckResult>> {
    return this.repo.googleCheck(accessToken);
  }
}
