import { apiClient } from './client';
import { Review } from '@/types';

export interface ReviewApiResponse {
  id: string;
  nurseId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

function toReview(r: ReviewApiResponse): Review {
  return {
    id: r.id,
    userId: r.userId ?? '',
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
  };
}

export const reviewApi = {
  getByNurse: async (nurseId: string): Promise<Review[]> => {
    const data = await apiClient.get<ReviewApiResponse[]>(`/api/reviews/nurse/${nurseId}`);
    return data.map(toReview);
  },

  create: async (nurseId: string, userName: string, rating: number, comment: string): Promise<Review> => {
    const data = await apiClient.post<ReviewApiResponse>('/api/reviews', {
      nurseId,
      userName,
      rating,
      comment,
    });
    return toReview(data);
  },
};
