import { Suspense } from 'react';
import ModernMessagesContent from '@/components/messages/ModernMessagesContent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<LoadingSpinner />}>
        <ModernMessagesContent />
      </Suspense>
    </div>
  );
}