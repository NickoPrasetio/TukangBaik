// Semua kemungkinan error code dari auth flow
export type AuthErrorCode =
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

// Result type — pengganti boolean return. Bawa data ATAU error, tidak pernah keduanya.
export type AuthResult<T> =
  | { success: true;  data: T }
  | { success: false; error: AuthError };
