import { Booking } from '@/types';
import { bookingApi, CreateBookingPayload } from '@/lib/api/booking.api';

export interface CreateBookingResult {
  success: boolean;
  data?: Booking;
  error?: string;
}

export class CreateBookingUseCase {
  async execute(payload: CreateBookingPayload, token: string): Promise<CreateBookingResult> {
    try {
      const data = await bookingApi.create(payload, token);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal membuat booking',
      };
    }
  }
}
