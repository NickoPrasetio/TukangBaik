import AuthGuard from '@/components/features/auth/AuthGuard';
import Navbar from '@/components/features/dashboard/Navbar';
import WorkerList from '@/components/features/dashboard/WorkerList';

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
