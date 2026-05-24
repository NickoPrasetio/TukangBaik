import { IAuthRepository, SignupInput, AuthSession } from '../IAuthRepository';
import { AuthResult } from '../AuthError';

/**
 * Signup use case — tidak tahu soal React, Next.js, routing, atau store.
 * Satu-satunya tanggung jawab: mengeksekusi proses signup.
 */
export class SignupUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  execute(input: SignupInput): Promise<AuthResult<AuthSession>> {
    return this.authRepo.signup(input);
  }
}
