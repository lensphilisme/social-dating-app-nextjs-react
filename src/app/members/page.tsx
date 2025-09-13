import { Suspense } from 'react';
import MembersContent from '@/components/members/MembersContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <MembersContent />
      </Suspense>
    </div>
  );
}
