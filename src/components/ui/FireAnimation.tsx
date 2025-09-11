'use client';

import { motion } from 'framer-motion';

export default function FireAnimation({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <motion.div className={`relative ${className}`}>
      {/* Main fire */}
      <motion.svg
        className="absolute inset-0 text-orange-500"
        fill="currentColor"
        viewBox="0 0 24 24"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </motion.svg>
      
      {/* Fire particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 5}%`,
          }}
          animate={{
            y: [-5, -15, -5],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-orange-400 to-red-500 rounded-full blur-sm opacity-50"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
