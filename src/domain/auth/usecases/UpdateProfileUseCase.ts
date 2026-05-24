import { IAuthRepository } from '../IAuthRepository';
import { AuthResult } from '../AuthError';
import { User } from '@/types';

export class UpdateProfileUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  execute(token: string, data: { name?: string; phone?: string }): Promise<AuthResult<User>> {
    return this.authRepo.updateProfile(token, data);
  }
}
