import TukangGuard from '@/components/features/auth/TukangGuard';
import TukangDashboardContent from '@/components/features/tukang-dashboard/TukangDashboardContent';

export default function TukangDashboardPage() {
  return (
    <TukangGuard>
      <TukangDashboardContent />
    </TukangGuard>
  );
}
