import { Suspense } from 'react';
import NotificationsContent from './NotificationsContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<LoadingSpinner />}>
        <NotificationsContent />
      </Suspense>
    </div>
  );
}
