import { apiClient } from './client';
import { Nurse } from '@/types';

export interface NurseApiResponse {
  id: string;
  name: string;
  avatar: string;
  age: number;
  experience: number;
  rating: number;
  totalReviews: number;
  specializations: string[];
  location: string;
  pricePerDay: number;
  isAvailable: boolean;
  bio: string;
}

function toNurse(n: NurseApiResponse): Nurse {
  return { ...n, reviews: [] };
}

export const nurseApi = {
  getAll: async (search?: string, available?: boolean): Promise<Nurse[]> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (available !== undefined) params.set('available', String(available));
    const query = params.toString() ? `?${params}` : '';
    const data = await apiClient.get<NurseApiResponse[]>(`/api/nurses${query}`);
    return data.map(toNurse);
  },

  getById: async (id: string): Promise<Nurse> => {
    const data = await apiClient.get<NurseApiResponse>(`/api/nurses/${id}`);
    return toNurse(data);
  },
};
