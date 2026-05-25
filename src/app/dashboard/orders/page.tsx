import AuthGuard from '@/components/features/auth/AuthGuard';
import CustomerOrderListContent from '@/components/features/dashboard/CustomerOrderListContent';

export default function CustomerOrdersPage() {
  return (
    <AuthGuard>
      <CustomerOrderListContent />
    </AuthGuard>
  );
}
