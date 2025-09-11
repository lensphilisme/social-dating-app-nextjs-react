'use client';

import { useState, useRef, useEffect } from 'react';
import { Member } from '@prisma/client';
import { calculateAge, transformImageUrl } from '@/lib/util';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import FireAnimation from '@/components/ui/FireAnimation';

type Props = {
  member: Member;
  index: number;
  onSwipe: (direction: 'left' | 'right', member: Member) => void;
  onMatchRequest: (member: Member) => void;
  isTop: boolean;
};

export default function SwipeCard({ member, index, onSwipe, onMatchRequest, isTop }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const passOpacity = useTransform(x, [-200, -100], [1, 0]);
  const likeOpacity = useTransform(x, [100, 200], [0, 1]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 100;
    if (info.offset.x > threshold) {
      // Swipe right
      onSwipe('right', member);
    } else if (info.offset.x < -threshold) {
      // Swipe left
      onSwipe('left', member);
    }
  };

  // Parse hobbies from the member data
  const hobbies = member.hobbies ? member.hobbies.split(',').map(h => h.trim()).filter(h => h) : [];

  const cardStyle = {
    x,
    rotate,
    opacity,
    zIndex: 10 - index,
    scale: isTop ? 1 : 1 - index * 0.05,
    y: isTop ? 0 : index * 10,
  };

  return (
    <motion.div
      className="absolute inset-0 bg-black shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: cardStyle.scale, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Profile Image */}
      <div className="relative h-full">
        <img
          src={transformImageUrl(member.image) || '/images/user.png'}
          alt={member.name}
          className="w-full h-full object-cover"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-12 left-4">
          <button className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Name and Verification - Bottom Position */}
        <div className="absolute bottom-24 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-white">{member.name}</h2>
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Bio - Limited to 2 lines */}
          <p 
            className="text-white text-lg leading-relaxed mb-4"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {member.description || `Hi, I'm ${member.name}. I'm ${calculateAge(member.dateOfBirth)} years old and live in ${member.city}. Want to get acquainted with me?`}
          </p>

          {/* Hobbies Tags */}
          {hobbies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {hobbies.slice(0, 8).map((hobby, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30"
                >
                  {hobby}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Black Shadow at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

        {/* Action Buttons - Positioned exactly above bottom nav */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          {/* Pass Button */}
          <button
            onClick={() => onSwipe('left', member)}
            className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-red-500/30 hover:border-red-400 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Match Request Button (Fire) */}
          <button
            onClick={() => onMatchRequest(member)}
            className="w-16 h-16 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Fire animation */}
            <FireAnimation className="w-8 h-8 text-white relative z-10" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          </button>

          {/* Like Button */}
          <button
            onClick={() => onSwipe('right', member)}
            className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-pink-500/30 hover:border-pink-400 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Swipe Indicators */}
      {isTop && (
        <>
          <motion.div
            className="absolute top-1/2 left-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12 shadow-lg"
            style={{ opacity: passOpacity }}
          >
            PASS
          </motion.div>
          <motion.div
            className="absolute top-1/2 right-8 bg-pink-500 text-white px-6 py-3 rounded-full font-bold text-xl transform rotate-12 shadow-lg"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
        </>
      )}
    </motion.div>
  );
}