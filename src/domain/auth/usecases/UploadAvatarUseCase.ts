import { IAuthRepository } from '../IAuthRepository';
import { AuthResult } from '../AuthError';
import { User } from '@/types';

export class UploadAvatarUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  execute(token: string, file: File): Promise<AuthResult<User>> {
    return this.authRepo.uploadAvatar(token, file);
  }
}
