import { AuthResult } from './AuthError';
import { User } from '@/types';

// ─── Input / Output shapes (domain models, bukan API shapes) ─────────────────

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthSession {
  user: User;
  token: string;
}

/**
 * Hasil cek Google login:
 * - isNewUser == true  → user belum ada di DB; data Google untuk pre-fill form
 * - isNewUser == false → user sudah ada; AuthSession lengkap tersedia
 */
export type GoogleCheckResult =
  | { isNewUser: true; name: string; email: string; avatar?: string }
  | { isNewUser: false; session: AuthSession };

// ─── Kontrak — use case bergantung ke interface ini, bukan implementasi konkret ─

export interface IAuthRepository {
  signup(input: SignupInput): Promise<AuthResult<AuthSession>>;
  login(email: string, password: string): Promise<AuthResult<AuthSession>>;
  googleCheck(accessToken: string): Promise<AuthResult<GoogleCheckResult>>;
  googleComplete(accessToken: string, userType: string, phone?: string): Promise<AuthResult<AuthSession>>;
  updateProfile(token: string, data: { name?: string; phone?: string }): Promise<AuthResult<User>>;
  uploadAvatar(token: string, file: File): Promise<AuthResult<User>>;
}
