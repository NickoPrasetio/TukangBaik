import Link from 'next/link';
import AuthGuard from '@/components/features/auth/AuthGuard';
import Navbar from '@/components/features/dashboard/Navbar';
import WorkerList from '@/components/features/dashboard/WorkerList';
import { ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AuthGuard>
    <main className="flex flex-col min-h-dvh bg-[#f8fafc]">
      <Navbar />

      {/* Banner */}
      <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 p-5 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-white/80 text-sm">Cari tukang terbaik untuk</p>
        <h2 className="text-white text-xl font-bold mt-0.5">Rumah Anda 🏠</h2>
        <p className="text-white/70 text-xs mt-2 max-w-[180px] leading-relaxed">
          Tukang berpengalaman & terpercaya siap membantu Anda
        </p>
      </div>

      {/* My Order shortcut */}
      <div className="px-4 mt-4">
        <Link
          href="/dashboard/orders"
          className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 border border-blue-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">My Order</p>
              <p className="text-xs text-gray-400">Lihat & kelola ordermu</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
            Lihat
          </span>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        {[
          { label: 'Tukang', value: '6+', icon: '👷' },
          { label: 'Kota', value: '5', icon: '📍' },
          { label: 'Terverifikasi', value: '100%', icon: '✅' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <span className="text-xl">{icon}</span>
            <p className="text-base font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Section title */}
      <div className="flex items-center justify-between px-4 mt-5 mb-1">
        <h3 className="text-base font-bold text-gray-900">Daftar Tukang</h3>
      </div>

      {/* Worker list */}
      <div className="px-4 pb-8">
        <WorkerList />
      </div>
    </main>
    </AuthGuard>
  );
}
