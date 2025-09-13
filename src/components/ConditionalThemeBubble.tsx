'use client';

import { usePathname } from 'next/navigation';
import ThemeBubble from './ThemeBubble';

export default function ConditionalThemeBubble() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return <ThemeBubble />;
}

