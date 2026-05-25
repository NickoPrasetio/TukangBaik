/**
 * Module-level singletons — satu instance dipakai seluruh app.
 */
import { AuthRepository } from './AuthRepository';
import { SignupUseCase }           from '@/domain/auth/usecases/SignupUseCase';
import { LoginUseCase }            from '@/domain/auth/usecases/LoginUseCase';
import { GoogleCheckUseCase }      from '@/domain/auth/usecases/GoogleCheckUseCase';
import { GoogleCompleteUseCase }   from '@/domain/auth/usecases/GoogleCompleteUseCase';
import { FacebookCheckUseCase }    from '@/domain/auth/usecases/FacebookCheckUseCase';
import { FacebookCompleteUseCase } from '@/domain/auth/usecases/FacebookCompleteUseCase';
import { UpdateProfileUseCase }    from '@/domain/auth/usecases/UpdateProfileUseCase';
import { UploadAvatarUseCase }     from '@/domain/auth/usecases/UploadAvatarUseCase';

const authRepository = new AuthRepository();

export const signupUseCase           = new SignupUseCase(authRepository);
export const loginUseCase            = new LoginUseCase(authRepository);
export const googleCheckUseCase      = new GoogleCheckUseCase(authRepository);
export const googleCompleteUseCase   = new GoogleCompleteUseCase(authRepository);
export const facebookCheckUseCase    = new FacebookCheckUseCase(authRepository);
export const facebookCompleteUseCase = new FacebookCompleteUseCase(authRepository);
export const updateProfileUseCase    = new UpdateProfileUseCase(authRepository);
export const uploadAvatarUseCase     = new UploadAvatarUseCase(authRepository);
