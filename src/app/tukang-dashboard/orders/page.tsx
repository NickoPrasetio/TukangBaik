import TukangGuard from '@/components/features/auth/TukangGuard';
import OrderListContent from '@/components/features/tukang-dashboard/OrderListContent';

export default function TukangOrdersPage() {
  return (
    <TukangGuard>
      <OrderListContent />
    </TukangGuard>
  );
}
