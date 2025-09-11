import { Suspense } from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}