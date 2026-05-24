'use client';

import {
  MapPin, Briefcase, Wallet,
  CheckCircle2, XCircle, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react';
import { WorkStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useTukangDashboard } from '@/hooks/useTukangDashboard';
import TukangNavbar from './TukangNavbar';

// ─── WorkStatus Option Card ───────────────────────────────────────────────────

interface StatusOptionProps {
  value: WorkStatus;
  current: WorkStatus;
  disabled: boolean;
  onSelect: (s: WorkStatus) => void;
}

function WorkStatusOption({ value, current, disabled, onSelect }: StatusOptionProps) {
  const isSelected = value === current;
  const isOpen = value === 'OPEN';

  const styles = {
    OPEN: {
      base: isSelected
        ? 'border-green-500 bg-green-50 shadow-green-100 shadow-md'
        : 'border-gray-200 bg-white hover:border-green-300',
      dot: 'bg-green-500',
      label: isSelected ? 'text-green-700' : 'text-gray-600',
      desc: isSelected ? 'text-green-500' : 'text-gray-400',
      badge: 'bg-green-100 text-green-600',
    },
    CLOSED: {
      base: isSelected
        ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md'
        : 'border-gray-200 bg-white hover:border-red-300',
      dot: 'bg-red-400',
      label: isSelected ? 'text-red-700' : 'text-gray-600',
      desc: isSelected ? 'text-red-400' : 'text-gray-400',
      badge: 'bg-red-100 text-red-500',
    },
  }[value];

  return (
    <button
      type="button"
      onClick={() => !disabled && !isSelected && onSelect(value)}
      disabled={disabled || isSelected}
      className={`relative flex-1 flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all
        ${styles.base} disabled:cursor-not-allowed`}
    >
      {isSelected && (
        <CheckCircle2 size={16} className={`absolute top-2 right-2 ${isOpen ? 'text-green-500' : 'text-red-400'}`} />
      )}

      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${styles.dot} ${isSelected && isOpen ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-bold ${styles.label}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <span className={`text-xs text-center leading-relaxed ${styles.desc}`}>
        {isOpen ? 'Siap menerima\npekerjaan' : 'Tidak tersedia\nsementara'}
      </span>

      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
        {isOpen ? 'OPEN' : 'CLOSED'}
      </span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TukangDashboardContent() {
  const user = useAuthStore((s) => s.user);
  const {
    workStatus,
    isSavingStatus,
    statusError,
    profileLoadStatus,
    dailySalary,
    isSavingSalary,
    salarySaved,
    salaryError,
    locStatus,
    locCoords,
    locError,
    setWorkStatus,
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

        {/* Status badge di banner */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
          <span className={`w-2 h-2 rounded-full ${
            workStatus === 'OPEN' ? 'bg-green-300 animate-pulse' : 'bg-red-300'
          }`} />
          <span className="text-white text-xs font-semibold">
            {workStatus === 'OPEN' ? 'Menerima Pekerjaan' : 'Tidak Menerima Pekerjaan'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 mt-4 pb-8">

        {/* Status Pekerjaan */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Briefcase size={20} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Status Pekerjaan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Atur ketersediaan Anda saat ini</p>
              </div>
            </div>

            {isSavingStatus && (
              <Loader2 size={18} className="animate-spin text-orange-400" />
            )}
          </div>

          {/* Loading state saat ambil profil */}
          {profileLoadStatus === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Memuat status...</span>
            </div>
          ) : (
            <div className="flex gap-3">
              <WorkStatusOption
                value="OPEN"
                current={workStatus}
                disabled={isSavingStatus}
                onSelect={setWorkStatus}
              />
              <WorkStatusOption
                value="CLOSED"
                current={workStatus}
                disabled={isSavingStatus}
                onSelect={setWorkStatus}
              />
            </div>
          )}

          {profileLoadStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle size={16} className="text-amber-400 shrink-0" />
              <p className="text-xs text-amber-600">
                Profil tukang belum terhubung. Hubungi admin untuk aktivasi.
              </p>
            </div>
          )}

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
