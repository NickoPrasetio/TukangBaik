'use client';

import { useEffect } from 'react';

/**
 * Jalankan `callback(value)` setelah `delay` ms sejak value terakhir berubah.
 * Dipakai untuk menunda search query agar tidak fetch setiap ketikan.
 */
export function useDebounce<T>(value: T, delay: number, callback: (v: T) => void) {
  useEffect(() => {
    const timer = setTimeout(() => callback(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay, callback]);
}
