'use client';

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface HeartAnimationProps {
  className?: string;
}

export default function HeartAnimation({ className = "w-8 h-8" }: HeartAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isLoadedRef.current) return;

    const loadAnimation = async () => {
      try {
        // Clear any existing content first
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const response = await fetch('/heart.json');
        const animationData = await response.json();
        
        if (containerRef.current && !isLoadedRef.current) {
          animationRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData,
          });
          isLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading heart animation:', error);
        // Fallback to simple heart icon
        if (containerRef.current && !isLoadedRef.current) {
          containerRef.current.innerHTML = `
            <svg class="${className} text-pink-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          `;
          isLoadedRef.current = true;
        }
      }
    };

    loadAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
      isLoadedRef.current = false;
    };
  }, [className]);

  return <div ref={containerRef} className={className} />;
}