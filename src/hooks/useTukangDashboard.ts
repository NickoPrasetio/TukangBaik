'use client';

import { useState, useCallback, useEffect } from 'react';
import { WorkStatus } from '@/types';
import { useAuthStore } from '@/store/authStore';
import {
  GetTukangProfileUseCase,
  UpdateTukangStatusUseCase,
  UpdateTukangSalaryUseCase,
  UpdateTukangLocationUseCase,
} from '@/domain/tukang/usecases';

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';
type ProfileLoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface UseTukangDashboardState {
  // Status pekerjaan
  workStatus: WorkStatus;
  isSavingStatus: boolean;
  statusError: string;
  profileLoadStatus: ProfileLoadStatus;

  // Gaji harian
  dailySalary: string;
  isSavingSalary: boolean;
  salarySaved: boolean;
  salaryError: string;

  // Lokasi
  locStatus: LocationStatus;
  locCoords: LocationCoords | null;
  locError: string;
}

interface UseTukangDashboardActions {
  setWorkStatus: (status: WorkStatus) => Promise<void>;
  setDailySalary: (value: string) => void;
  saveSalary: () => Promise<void>;
  syncLocation: () => Promise<void>;
}

export function useTukangDashboard(): UseTukangDashboardState & UseTukangDashboardActions {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Status pekerjaan
  const [workStatus, setWorkStatusState] = useState<WorkStatus>('OPEN');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [profileLoadStatus, setProfileLoadStatus] = useState<ProfileLoadStatus>('idle');

  // Gaji harian
  const [dailySalary, setDailySalary] = useState('');
  const [isSavingSalary, setIsSavingSalary] = useState(false);
  const [salarySaved, setSalarySaved] = useState(false);
  const [salaryError, setSalaryError] = useState('');

  // Lokasi
  const [locStatus, setLocStatus] = useState<LocationStatus>('idle');
  const [locCoords, setLocCoords] = useState<LocationCoords | null>(null);
  const [locError, setLocError] = useState('');

  // ─── Load profil tukang saat mount ────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      setProfileLoadStatus('loading');
      const useCase = new GetTukangProfileUseCase();
      const result = await useCase.execute(token);

      if (result.success && result.data) {
        setWorkStatusState(result.data.workStatus ?? 'OPEN');
        if (result.data.pricePerDay) {
          setDailySalary(String(result.data.pricePerDay));
        }
        setProfileLoadStatus('success');
      } else {
        // Profil belum terhubung — tampilkan default tanpa error ke user
        setProfileLoadStatus('error');
      }
    };

    loadProfile();
  }, [token]);

  // ─── Update work status (OPEN / CLOSED) ───────────────────────────────────
  const setWorkStatus = useCallback(async (newStatus: WorkStatus) => {
    if (!token) {
      setStatusError('Token tidak ditemukan');
      return;
    }

    setIsSavingStatus(true);
    setStatusError('');

    const useCase = new UpdateTukangStatusUseCase();
    const result = await useCase.execute(newStatus, token);

    if (result.success) {
      setWorkStatusState(newStatus);
    } else {
      setStatusError(result.error ?? 'Gagal mengupdate status');
    }
    setIsSavingStatus(false);
  }, [token]);

  // ─── Simpan gaji harian ───────────────────────────────────────────────────
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
      setSalaryError(result.error ?? 'Gagal menyimpan gaji');
    }
    setIsSavingSalary(false);
  }, [token, dailySalary]);

  // ─── Sinkronisasi lokasi GPS ──────────────────────────────────────────────
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
          setLocError(result.error ?? 'Gagal menyimpan lokasi');
        }
      },
      (err) => {
        setLocStatus('error');
        setLocError(err.message);
      },
    );
  }, [token, setUser]);

  return {
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
  };
}
