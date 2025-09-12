'use client';

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface CheckAnimationProps {
  className?: string;
}

export default function CheckAnimation({ className = "w-6 h-6" }: CheckAnimationProps) {
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

        const response = await fetch('/Check Animation.json');
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
        console.error('Error loading check animation:', error);
        // Fallback to simple check icon
        if (containerRef.current && !isLoadedRef.current) {
          containerRef.current.innerHTML = `
            <svg class="${className} text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
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