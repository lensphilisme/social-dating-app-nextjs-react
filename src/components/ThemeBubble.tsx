'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaintBrushIcon, XMarkIcon } from '@heroicons/react/24/outline';
import UserThemePicker from './UserThemePicker';

export default function ThemeBubble() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isHiddenPermanently, setIsHiddenPermanently] = useState(false);

  useEffect(() => {
    // Check if user has hidden the bubble permanently
    const hiddenPermanently = localStorage.getItem('themeBubbleHidden');
    if (hiddenPermanently === 'true') {
      setIsHiddenPermanently(true);
      return;
    }

    // Check last shown time
    const lastShown = localStorage.getItem('themeBubbleLastShown');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (!lastShown || now - parseInt(lastShown) > oneHour) {
      // Show bubble after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('themeBubbleLastShown', now.toString());
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleBubbleClick = () => {
    setShowPicker(true);
    setIsVisible(false);
  };

  const handleClosePicker = () => {
    setShowPicker(false);
  };

  const handleHidePermanently = () => {
    localStorage.setItem('themeBubbleHidden', 'true');
    setIsHiddenPermanently(true);
    setShowPicker(false);
  };

  if (isHiddenPermanently) return null;

  return (
    <>
      {/* Theme Bubble */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6"
          >
            <motion.button
              onClick={handleBubbleClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <PaintBrushIcon className="w-5 h-5" />
              
              {/* Pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap hidden md:block">
                Customize your theme
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Picker */}
      <UserThemePicker
        isVisible={showPicker}
        onClose={handleClosePicker}
        onHidePermanently={handleHidePermanently}
      />
    </>
  );
}
