export type WorkStatus = 'OPEN' | 'CLOSED' | 'BOOKED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentMethod = 'CASH';

export interface Booking {
  id: string;
  workerId: string;
  workerName?: string;
  workerAvatar?: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  bookingDate: string;
  startTime: string;
  durationDays: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  userType?: string;
  latitude?: number;
  longitude?: number;
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
  workStatus: WorkStatus;
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
