'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeartIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

export default function HeroSection() {
  const { data: session } = useSession();

  // Random avatar positions and animations
  const avatars = [
    { id: 1, x: 10, y: 20, animation: 'bounce', delay: 0 },
    { id: 2, x: 80, y: 15, animation: 'float', delay: 1 },
    { id: 3, x: 20, y: 70, animation: 'zoom', delay: 2 },
    { id: 4, x: 70, y: 60, animation: 'slide', delay: 3 },
    { id: 5, x: 50, y: 30, animation: 'rotate', delay: 4 },
    { id: 6, x: 30, y: 50, animation: 'pulse', delay: 5 },
    { id: 7, x: 90, y: 40, animation: 'bounce', delay: 6 },
    { id: 8, x: 60, y: 80, animation: 'float', delay: 7 },
  ];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Animated Avatars */}
      <div className="absolute inset-0 pointer-events-none">
        {avatars.map((avatar) => (
          <motion.div
            key={avatar.id}
            className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 shadow-lg"
            style={{
              left: `${avatar.x}%`,
              top: `${avatar.y}%`,
            }}
            animate={{
              y: avatar.animation === 'bounce' ? [-10, 10, -10] : 
                 avatar.animation === 'float' ? [-5, 5, -5] :
                 avatar.animation === 'zoom' ? [1, 1.1, 1] :
                 avatar.animation === 'slide' ? [-20, 20, -20] :
                 avatar.animation === 'rotate' ? [0, 360] :
                 avatar.animation === 'pulse' ? [1, 1.2, 1] : [0, 0],
              x: avatar.animation === 'slide' ? [-10, 10, -10] : 0,
              scale: avatar.animation === 'zoom' ? [1, 1.1, 1] : 
                     avatar.animation === 'pulse' ? [1, 1.2, 1] : 1,
              rotate: avatar.animation === 'rotate' ? [0, 360] : 0,
            }}
            transition={{
              duration: avatar.animation === 'rotate' ? 4 : 3,
              repeat: Infinity,
              delay: avatar.delay,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-300 to-secondary-300 flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            Find Your
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Perfect Match</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with amazing people who share your values, interests, and dreams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link
                href="/dashboard"
                className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-2xl font-semibold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Go to Dashboard
                <ArrowRightIcon className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-2xl font-semibold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRightIcon className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="group flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <PlayIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Login</span>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
