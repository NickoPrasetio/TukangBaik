import { apiClient } from './client';

export interface TukangStatusPayload {
  isAvailable: boolean;
}

export interface TukangSalaryPayload {
  pricePerDay: number;
}

export interface TukangLocationPayload {
  latitude: number;
  longitude: number;
}

export interface TukangUpdateResponse {
  success: boolean;
  message?: string;
}

export const tukangApi = {
  updateStatus: (payload: TukangStatusPayload, token: string) =>
    apiClient.patch<TukangUpdateResponse>('/api/tukang/status', payload, token),

  updateSalary: (payload: TukangSalaryPayload, token: string) =>
    apiClient.patch<TukangUpdateResponse>('/api/tukang/salary', payload, token),

  updateLocation: (payload: TukangLocationPayload, token: string) =>
    apiClient.patch<TukangUpdateResponse>('/api/tukang/location', payload, token),
};
