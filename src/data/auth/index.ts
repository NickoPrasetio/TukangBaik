/**
 * Module-level singletons — satu instance dipakai seluruh app.
 * Untuk testing: buat instance baru dengan MockAuthRepository.
 *
 * Contoh test:
 *   const mockRepo = new MockAuthRepository();
 *   const useCase  = new SignupUseCase(mockRepo);
 */
import { AuthRepository } from './AuthRepository';
import { SignupUseCase } from '@/domain/auth/usecases/SignupUseCase';
import { LoginUseCase } from '@/domain/auth/usecases/LoginUseCase';
import { UpdateProfileUseCase } from '@/domain/auth/usecases/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '@/domain/auth/usecases/UploadAvatarUseCase';

const authRepository = new AuthRepository();

export const signupUseCase       = new SignupUseCase(authRepository);
export const loginUseCase        = new LoginUseCase(authRepository);
export const updateProfileUseCase = new UpdateProfileUseCase(authRepository);
export const uploadAvatarUseCase  = new UploadAvatarUseCase(authRepository);
