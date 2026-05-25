import { Booking } from '@/types';
import { apiClient } from './client';

export interface CreateBookingPayload {
  workerId: string;
  customerName: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  bookingDate: string;   // ISO date: "2024-12-01"
  startTime: string;     // "09:00"
  durationDays: number;
  paymentMethod: string;
  notes?: string;
}

export const bookingApi = {
  create: (payload: CreateBookingPayload, token: string) =>
    apiClient.post<Booking>('/api/bookings', payload, token),

  getMy: (token: string) =>
    apiClient.get<Booking[]>('/api/bookings/my', token),

  getById: (id: string, token: string) =>
    apiClient.get<Booking>(`/api/bookings/${id}`, token),

  /** Ambil order yang masuk ke tukang yang sedang login */
  getWorkerOrders: (token: string) =>
    apiClient.get<Booking[]>('/api/bookings/my-orders', token),

  /** Waktu server — dipakai untuk validasi tanggal agar tidak bisa dimanipulasi device */
  getServerTime: () =>
    apiClient.get<{ date: string; dateTime: string }>('/api/bookings/server-time'),

  /** Tukang memulai order: PENDING → CONFIRMED */
  confirmOrder: (id: string, token: string) =>
    apiClient.patch<Booking>(`/api/bookings/${id}/confirm`, {}, token),
};
