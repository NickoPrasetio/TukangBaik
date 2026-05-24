import { WorkStatus } from '@/types';
import { apiClient } from './client';

export interface TukangStatusPayload {
  status: WorkStatus;
}

export interface TukangSalaryPayload {
  pricePerDay: number;
}

export interface TukangLocationPayload {
  latitude: number;
  longitude: number;
}

export interface TukangProfileResponse {
  id: string;
  name: string;
  workStatus: WorkStatus;
  isAvailable: boolean;
  pricePerDay: number;
  latitude: number | null;
  longitude: number | null;
}

export const tukangApi = {
  getProfile: (token: string) =>
    apiClient.get<TukangProfileResponse>('/api/tukang/profile', token),

  updateStatus: (payload: TukangStatusPayload, token: string) =>
    apiClient.patch<TukangProfileResponse>('/api/tukang/status', payload, token),

  updateSalary: (payload: TukangSalaryPayload, token: string) =>
    apiClient.patch<TukangProfileResponse>('/api/tukang/salary', payload, token),

  updateLocation: (payload: TukangLocationPayload, token: string) =>
    apiClient.patch<TukangProfileResponse>('/api/tukang/location', payload, token),
};
