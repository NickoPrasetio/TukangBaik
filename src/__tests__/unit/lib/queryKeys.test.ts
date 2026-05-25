import { queryKeys } from '@/lib/queryKeys';

describe('queryKeys', () => {
  describe('workers', () => {
    it('all returns static key', () => {
      expect(queryKeys.workers.all).toEqual(['workers']);
    });

    it('list includes search and available params', () => {
      expect(queryKeys.workers.list('plumbing', true)).toEqual(
        ['workers', 'list', { search: 'plumbing', available: true }],
      );
    });

    it('list with no params still has object slot', () => {
      expect(queryKeys.workers.list()).toEqual(
        ['workers', 'list', { search: undefined, available: undefined }],
      );
    });

    it('detail includes worker id', () => {
      expect(queryKeys.workers.detail('worker-1')).toEqual(['workers', 'detail', 'worker-1']);
    });
  });

  describe('bookings', () => {
    it('workerOrders key is unique', () => {
      expect(queryKeys.bookings.workerOrders).toEqual(['bookings', 'worker-orders']);
    });

    it('my key', () => {
      expect(queryKeys.bookings.my).toEqual(['bookings', 'my']);
    });

    it('detail includes booking id', () => {
      expect(queryKeys.bookings.detail('booking-1')).toEqual(['bookings', 'detail', 'booking-1']);
    });
  });

  describe('reviews', () => {
    it('byWorker includes worker id', () => {
      expect(queryKeys.reviews.byWorker('worker-1')).toEqual(['reviews', 'worker', 'worker-1']);
    });
  });
});
