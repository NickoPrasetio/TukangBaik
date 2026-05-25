import { CreateBookingUseCase } from '@/domain/booking/usecases/CreateBookingUseCase';
import { bookingApi } from '@/lib/api/booking.api';
import { MOCK_BOOKING } from '../../setup/handlers';

jest.mock('@/lib/api/booking.api', () => ({
  bookingApi: { create: jest.fn() },
}));

const mockCreate = bookingApi.create as jest.Mock;

const PAYLOAD = {
  workerId:      'worker-1',
  customerName:  'Budi Santoso',
  address:       'Jl. Contoh No. 1',
  city:          'Jakarta',
  latitude:      -6.2,
  longitude:     106.816,
  bookingDate:   '2026-05-25',
  startTime:     '08:00',
  durationDays:  2,
  paymentMethod: 'CASH',
};

describe('CreateBookingUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns success with booking data on successful API call', async () => {
    mockCreate.mockResolvedValue(MOCK_BOOKING);
    const useCase = new CreateBookingUseCase();
    const result  = await useCase.execute(PAYLOAD, 'mock-token');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe('booking-1');
  });

  it('returns failure with error message when API throws', async () => {
    mockCreate.mockRejectedValue(new Error('Tukang tidak tersedia'));
    const useCase = new CreateBookingUseCase();
    const result  = await useCase.execute(PAYLOAD, 'mock-token');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain('Tukang tidak tersedia');
  });

  it('returns generic error message when non-Error is thrown', async () => {
    mockCreate.mockRejectedValue('unknown error');
    const useCase = new CreateBookingUseCase();
    const result  = await useCase.execute(PAYLOAD, 'mock-token');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('Gagal membuat booking');
  });
});
