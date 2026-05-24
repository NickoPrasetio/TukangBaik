'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ProfileModal from '@/components/features/profile/ProfileModal';

export default function TukangNavbar() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-orange-500/95 backdrop-blur-md border-b border-orange-400">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-xs text-orange-200">Selamat datang,</p>
            <p className="text-base font-bold text-white leading-tight">
              {user?.name ?? 'Tukang'} 👋
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="relative p-1 rounded-full hover:ring-2 hover:ring-white/50 transition-all"
              aria-label="Profil"
            >
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
              aria-label="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
