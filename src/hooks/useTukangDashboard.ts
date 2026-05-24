'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  UpdateTukangStatusUseCase,
  UpdateTukangSalaryUseCase,
  UpdateTukangLocationUseCase,
} from '@/domain/tukang/usecases';

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface UseTukangDashboardState {
  isAccepting: boolean;
  isSavingStatus: boolean;
  statusError: string;

  dailySalary: string;
  isSavingSalary: boolean;
  salarySaved: boolean;
  salaryError: string;

  locStatus: LocationStatus;
  locCoords: LocationCoords | null;
  locError: string;
}

interface UseTukangDashboardActions {
  toggleAccepting: () => Promise<void>;
  setDailySalary: (value: string) => void;
  saveSalary: () => Promise<void>;
  syncLocation: () => Promise<void>;
}

export function useTukangDashboard(): UseTukangDashboardState & UseTukangDashboardActions {
  const { token, user } = useAuthStore((s) => ({ token: s.token, user: s.user }));
  const setUser = useAuthStore((s) => s.setUser);

  // Status Pekerjaan
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Gaji Harian
  const [dailySalary, setDailySalary] = useState('');
  const [isSavingSalary, setIsSavingSalary] = useState(false);
  const [salarySaved, setSalarySaved] = useState(false);
  const [salaryError, setSalaryError] = useState('');

  // Lokasi
  const [locStatus, setLocStatus] = useState<LocationStatus>('idle');
  const [locCoords, setLocCoords] = useState<LocationCoords | null>(null);
  const [locError, setLocError] = useState('');

  // ─── Toggles accepting work ────────────────────────────────────────────────
  const toggleAccepting = useCallback(async () => {
    if (!token) {
      setStatusError('Token tidak ditemukan');
      return;
    }

    const newState = !isAccepting;
    setIsSavingStatus(true);
    setStatusError('');

    const useCase = new UpdateTukangStatusUseCase();
    const result = await useCase.execute(newState, token);

    if (result.success) {
      setIsAccepting(newState);
    } else {
      setStatusError(result.error || 'Gagal mengupdate status');
    }
    setIsSavingStatus(false);
  }, [isAccepting, token]);

  // ─── Saves daily salary ────────────────────────────────────────────────────
  const saveSalary = useCallback(async () => {
    if (!token || !dailySalary) {
      setSalaryError('Gaji harus diisi');
      return;
    }

    const salaryNum = parseInt(dailySalary, 10);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      setSalaryError('Gaji harus berupa angka positif');
      return;
    }

    setIsSavingSalary(true);
    setSalaryError('');

    const useCase = new UpdateTukangSalaryUseCase();
    const result = await useCase.execute(salaryNum, token);

    if (result.success) {
      setSalarySaved(true);
      setTimeout(() => setSalarySaved(false), 2000);
    } else {
      setSalaryError(result.error || 'Gagal menyimpan gaji');
    }
    setIsSavingSalary(false);
  }, [token, dailySalary]);

  // ─── Syncs current location ────────────────────────────────────────────────
  const syncLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setLocError('Browser tidak mendukung GPS');
      return;
    }

    if (!token) {
      setLocStatus('error');
      setLocError('Token tidak ditemukan');
      return;
    }

    setLocStatus('loading');
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocCoords(coords);

        const useCase = new UpdateTukangLocationUseCase();
        const result = await useCase.execute(coords.lat, coords.lng, token);

        if (result.success) {
          setLocStatus('success');
          setUser({ latitude: coords.lat, longitude: coords.lng });
        } else {
          setLocStatus('error');
          setLocError(result.error || 'Gagal menyimpan lokasi');
        }
      },
      (err) => {
        setLocStatus('error');
        setLocError(err.message);
      },
    );
  }, [token, setUser]);

  return {
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
  };
}
