'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getActiveAnnouncements, markAnnouncementViewed, dismissAnnouncement } from '@/app/actions/announcementActions';
import { useSession } from 'next-auth/react';

// Google Fonts list
const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'Source Sans Pro',
  'Raleway', 'Ubuntu', 'Playfair Display', 'Merriweather', 'Lora',
  'Crimson Text', 'Libre Baskerville', 'Dancing Script', 'Pacifico',
  'Caveat', 'Kalam', 'Satisfy', 'Fira Code', 'Source Code Pro',
  'JetBrains Mono', 'Inconsolata', 'Inter', 'Poppins'
];

// Function to load Google Font
const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily || GOOGLE_FONTS.includes(fontFamily)) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  showDelay: number;
  duration: number;
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderStyle?: string;
    fontSize?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
}

interface AnnouncementPopupProps {
  sessionId: string;
}

export default function AnnouncementPopup({ sessionId }: AnnouncementPopupProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!session?.user?.id) return;
      
      try {
        const activeAnnouncements = await getActiveAnnouncements(session.user.id, sessionId);
        setAnnouncements(activeAnnouncements);
        
        if (activeAnnouncements.length > 0) {
          // Load Google Font if specified
          const firstAnnouncement = activeAnnouncements[0];
          if (firstAnnouncement.styling?.fontFamily && firstAnnouncement.styling.fontFamily.trim()) {
            loadGoogleFont(firstAnnouncement.styling.fontFamily);
          }
          
          // Show first announcement after delay
          setTimeout(() => {
            setIsVisible(true);
            if (session?.user?.id) {
              markAnnouncementViewed(firstAnnouncement.id, session.user.id, sessionId);
            }
          }, firstAnnouncement.showDelay * 1000);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [session?.user?.id, sessionId]);

  const currentAnnouncement = announcements[currentIndex];

  if (isLoading || !currentAnnouncement) {
    return null;
  }

  const handleDismiss = async () => {
    if (!session?.user?.id) return;
    
    try {
      await dismissAnnouncement(currentAnnouncement.id, session.user.id, sessionId);
      setIsVisible(false);
      
      // Show next announcement if available
      if (currentIndex < announcements.length - 1) {
        setTimeout(() => {
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          setIsVisible(true);
          if (announcements[nextIndex] && session?.user?.id) {
            markAnnouncementViewed(announcements[nextIndex].id, session.user.id, sessionId);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  // Get colors based on announcement type
  const getColors = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800'
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800'
        };
      case 'ERROR':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800'
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800'
        };
    }
  };

  const colors = getColors(currentAnnouncement.type);

  // Apply custom styling if available
  const customStyles = currentAnnouncement.styling ? {
    backgroundColor: currentAnnouncement.styling.backgroundColor || undefined,
    color: currentAnnouncement.styling.textColor || undefined,
    borderColor: currentAnnouncement.styling.borderColor || undefined,
    borderStyle: currentAnnouncement.styling.borderStyle || undefined,
    fontSize: currentAnnouncement.styling.fontSize || undefined,
    borderRadius: currentAnnouncement.styling.borderRadius || undefined,
    fontFamily: currentAnnouncement.styling.fontFamily || undefined
  } : {};

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-2 left-2 right-2 z-50"
        >
          <div
            className={`
              border rounded-lg shadow-lg p-2
              ${!currentAnnouncement.styling ? `${colors.bg} ${colors.border} ${colors.text}` : ''}
            `}
            style={customStyles}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-2">
                <p className="text-sm leading-relaxed">
                  {currentAnnouncement.message}
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded hover:bg-current/10 transition-colors duration-200 text-current opacity-70 hover:opacity-100"
                title="Dismiss"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}