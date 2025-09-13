'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface ConditionalMainPaddingProps {
  children: React.ReactNode;
}

export default function ConditionalMainPadding({ children }: ConditionalMainPaddingProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Listen for sidebar state changes from the Navigation component
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('sidebarOpen');
      if (stored !== null) {
        setSidebarOpen(JSON.parse(stored));
      }
    };

    // Check initial state
    const stored = localStorage.getItem('sidebarOpen');
    if (stored !== null) {
      setSidebarOpen(JSON.parse(stored));
    }

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    window.addEventListener('sidebarToggle', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleStorageChange);
    };
  }, []);
  
  // Add left padding based on user type and sidebar state
  let paddingClass = '';
  if (isAdmin) {
    // Admin users always have padding for their sidebar
    paddingClass = sidebarOpen ? 'lg:pl-80' : 'lg:pl-16';
  } else {
    // Regular users have padding for their sidebar
    paddingClass = sidebarOpen ? 'lg:pl-80' : 'lg:pl-16';
  }
  
  return (
    <main className={`relative ${paddingClass}`}>
      {children}
    </main>
  );
}
