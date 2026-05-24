'use client';

import {
  MapPin, Briefcase, Wallet,
  CheckCircle2, XCircle, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTukangDashboard } from '@/hooks/useTukangDashboard';
import TukangNavbar from './TukangNavbar';

export default function TukangDashboardContent() {
  const user = useAuthStore((s) => s.user);
  const {
    isAccepting,
    isSavingStatus,
    statusError,
    dailySalary,
    isSavingSalary,
    salarySaved,
    salaryError,
    locStatus,
    locCoords,
    locError,
    toggleAccepting,
    setDailySalary,
    saveSalary,
    syncLocation,
  } = useTukangDashboard();

  return (
    <main className="flex flex-col min-h-dvh bg-orange-50">
      <TukangNavbar />

      {/* Banner */}
      <div className="mx-4 mt-4 rounded-3xl bg-gradient-to-r from-orange-400 to-amber-500 p-5 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-white/80 text-sm">Dashboard Tukang</p>
        <h2 className="text-white text-xl font-bold mt-0.5">{user?.name} 🔧</h2>
        <p className="text-white/70 text-xs mt-2 max-w-[200px] leading-relaxed">
          Kelola status pekerjaan dan profil Anda di sini
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4 mt-4 pb-8">

        {/* Status Pekerjaan */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Briefcase size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Status Pekerjaan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Atur ketersediaan Anda saat ini</p>
            </div>
          </div>

          <button
            onClick={toggleAccepting}
            disabled={isSavingStatus}
            className={`w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-all font-semibold text-sm
              ${isAccepting
                ? 'bg-green-500 text-white shadow-lg shadow-green-200 hover:bg-green-600 disabled:opacity-60'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-60'
              }`}
          >
            <div className="flex items-center gap-3">
              {isSavingStatus
                ? <Loader2 size={22} className="animate-spin" />
                : isAccepting
                  ? <CheckCircle2 size={22} className="text-white" />
                  : <XCircle size={22} className="text-gray-400" />
              }
              <span>
                {isAccepting ? 'Menerima Pekerjaan' : 'Tidak Menerima Pekerjaan'}
              </span>
            </div>

            {/* Toggle switch visual */}
            <div className={`relative w-12 h-6 rounded-full transition-colors
              ${isAccepting ? 'bg-white/30' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all
                ${isAccepting ? 'left-7' : 'left-1'}`} />
            </div>
          </button>

          {statusError && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-500">{statusError}</p>
            </div>
          )}
        </div>

        {/* Gaji Harian */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Wallet size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Gaji Harian yang Diinginkan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tentukan tarif per hari Anda</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-4 py-3 focus-within:border-orange-400 transition-colors bg-orange-50/50">
              <span className="text-sm font-semibold text-gray-500 shrink-0">Rp</span>
              <input
                type="number"
                placeholder="150000"
                value={dailySalary}
                onChange={(e) => setDailySalary(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                min={0}
              />
              <span className="text-xs text-gray-400 shrink-0">/hari</span>
            </div>

            <button
              onClick={saveSalary}
              disabled={!dailySalary || isSavingSalary}
              className={`px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95
                ${salarySaved
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
            >
              {isSavingSalary
                ? <Loader2 size={18} className="animate-spin" />
                : salarySaved
                  ? <CheckCircle2 size={18} />
                  : 'Simpan'
              }
            </button>
          </div>

          {salaryError && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-500">{salaryError}</p>
            </div>
          )}
        </div>

        {/* Sync Lokasi */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <MapPin size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Lokasi Saya</h3>
              <p className="text-xs text-gray-400 mt-0.5">Perbarui lokasi agar mudah ditemukan customer</p>
            </div>
          </div>

          {locStatus === 'success' && locCoords && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <p className="font-mono text-xs text-green-600">
                  {locCoords.lat.toFixed(6)}, {locCoords.lng.toFixed(6)}
                </p>
              </div>
              <button onClick={syncLocation} className="text-green-400 hover:text-green-600 transition-colors" title="Perbarui">
                <RefreshCw size={14} />
              </button>
            </div>
          )}

          {locStatus === 'error' && (
            <div className="mb-3 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
              <XCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-500 flex-1">{locError}</p>
            </div>
          )}

          <button
            onClick={syncLocation}
            disabled={locStatus === 'loading'}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-white px-5 py-4 font-semibold text-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-60"
          >
            {locStatus === 'loading'
              ? <><Loader2 size={18} className="animate-spin" /> Mendapatkan Lokasi…</>
              : <><MapPin size={18} /> Sync Lokasi Saat Ini</>
            }
          </button>
        </div>

      </div>
    </main>
  );
}
