import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  return (
    <div className="h-screen bg-white overflow-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
      </Suspense>
    </div>
  );
}