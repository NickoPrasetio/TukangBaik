'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <p className="text-xs text-gray-400">Selamat datang,</p>
          <p className="text-base font-bold text-gray-900 leading-tight">
            {user?.name ?? 'Pengguna'} 👋
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
            aria-label="Notifikasi"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-400 rounded-full" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors text-gray-600"
            aria-label="Keluar"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
