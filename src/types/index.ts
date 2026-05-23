export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Worker {
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
  reviews: Review[];
}

export interface BookingRequest {
  workerId: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
