import { IAuthRepository, AuthSession } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  execute(email: string, password: string): Promise<AuthResult<AuthSession>> {
    return this.authRepo.login(email, password);
  }
}
