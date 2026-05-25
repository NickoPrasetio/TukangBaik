'use client';

import FacebookLogin from '@greatsumini/react-facebook-login';
import { Loader2 } from 'lucide-react';

interface FacebookLoginButtonProps {
  onToken: (accessToken: string) => void;
  isLoading?: boolean;
  label?: string;
}

/**
 * Tombol "Lanjutkan dengan Facebook" — dipakai di LoginForm dan SignupForm.
 * Menggunakan @greatsumini/react-facebook-login dengan custom render.
 */
export default function FacebookLoginButton({
  onToken,
  isLoading = false,
  label = 'Lanjutkan dengan Facebook',
}: FacebookLoginButtonProps) {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';

  return (
    <FacebookLogin
      appId={appId}
      onSuccess={(response) => {
        if (response.accessToken) {
          onToken(response.accessToken);
        }
      }}
      onFail={(error) => {
        console.error('Facebook login gagal:', error);
      }}
      render={({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          disabled={isLoading || !appId || appId === 'YOUR_FACEBOOK_APP_ID'}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#1877F2]/30 bg-[#1877F2] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#166FE5] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
        >
          {isLoading
            ? <Loader2 size={20} className="animate-spin text-white/70" />
            : <FacebookIcon />
          }
          <span>{isLoading ? 'Memproses…' : label}</span>
        </button>
      )}
    />
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
