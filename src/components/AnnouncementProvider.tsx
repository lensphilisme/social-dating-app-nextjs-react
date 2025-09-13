'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AnnouncementPopup from './AnnouncementPopup';

export default function AnnouncementProvider() {
  const [sessionId, setSessionId] = useState<string>('');
  const { data: session } = useSession();

  useEffect(() => {
    // Generate a unique session ID for this browser session
    const generateSessionId = () => {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    // Get or create session ID from localStorage
    let currentSessionId = localStorage.getItem('announcementSessionId');
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      localStorage.setItem('announcementSessionId', currentSessionId);
    }
    
    setSessionId(currentSessionId);
  }, []);

  // Only render announcement popup for authenticated users
  if (!session?.user?.id || !sessionId) {
    return null;
  }

  return <AnnouncementPopup sessionId={sessionId} />;
}

