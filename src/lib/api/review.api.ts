import { apiClient } from './client';
import { Review } from '@/types';

export interface ReviewApiResponse {
  id: string;
  workerId: string;
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
  getByWorker: async (workerId: string): Promise<Review[]> => {
    const data = await apiClient.get<ReviewApiResponse[]>(`/api/reviews/worker/${workerId}`);
    return data.map(toReview);
  },

  create: async (workerId: string, userName: string, rating: number, comment: string): Promise<Review> => {
    const data = await apiClient.post<ReviewApiResponse>('/api/reviews', {
      workerId,
      userName,
      rating,
      comment,
    });
    return toReview(data);
  },
};
