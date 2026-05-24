'use client';

import { useState, useEffect, useCallback } from 'react';
import { ILocationService } from '@/domain/location/ILocationService';
import { WebLocationService } from '@/data/location/WebLocationService';

export type LocationStatus = 'idle' | 'requesting' | 'loading' | 'success' | 'denied' | 'error';

export interface LocationState {
  status:    LocationStatus;
  latitude:  number | undefined;
  longitude: number | undefined;
  errorMsg:  string;
  retry:     () => void;
}

// Default ke web — inject RNLocationService saat pindah ke React Native
const defaultService = new WebLocationService();

export function useLocation(service: ILocationService = defaultService): LocationState {
  const [status,    setStatus]    = useState<LocationStatus>('idle');
  const [latitude,  setLatitude]  = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [errorMsg,  setErrorMsg]  = useState('');

  const fetchLocation = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');

    const result = await service.getCurrentPosition();

    if (result.success) {
      setLatitude(result.coords.latitude);
      setLongitude(result.coords.longitude);
      setStatus('success');
    } else {
      setErrorMsg(result.message);
      setStatus(result.code === 'PERMISSION_DENIED' ? 'denied' : 'error');
    }
  }, [service]);

  useEffect(() => {
    service.checkPermission().then((permission) => {
      if (permission === 'unsupported') {
        setStatus('error');
        setErrorMsg('Browser tidak mendukung GPS');
        return;
      }
      if (permission === 'denied') {
        setStatus('denied');
        setErrorMsg('Izin lokasi ditolak. Aktifkan di pengaturan browser.');
        return;
      }
      // 'granted' atau 'prompt' → langsung minta
      setStatus(permission === 'granted' ? 'loading' : 'requesting');
      fetchLocation();
    });
  }, [service, fetchLocation]);

  return { status, latitude, longitude, errorMsg, retry: fetchLocation };
}
