import { Suspense } from 'react';
import MessagesContent from '@/components/messages/MessagesContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<LoadingSpinner />}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}