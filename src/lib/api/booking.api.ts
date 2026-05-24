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
};
