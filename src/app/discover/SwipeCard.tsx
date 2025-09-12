'use client';

import { useState, useRef, useEffect } from 'react';
import { Member } from '@prisma/client';
import { calculateAge, transformImageUrl } from '@/lib/util';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import HeartAnimation from '@/components/ui/HeartAnimation';
import CheckAnimation from '@/components/ui/CheckAnimation';

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
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0]);
  const passOpacity = useTransform(x, [-200, -80], [1, 0]);
  const likeOpacity = useTransform(x, [80, 200], [0, 1]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 100; // Increased threshold - must swipe ALL the way
    if (info.offset.x > threshold) {
      // Swipe right - must go all the way
      onSwipe('right', member);
    } else if (info.offset.x < -threshold) {
      // Swipe left - must go all the way
      onSwipe('left', member);
    }
    // If not swiped far enough, card returns to original position
  };

  // Parse hobbies from the member data
  const hobbies = member.hobbies ? member.hobbies.split(',').map(h => h.trim()).filter(h => h) : [];

  const cardStyle = {
    x,
    rotate,
    opacity,
    zIndex: 10 - index,
    scale: isTop ? 1 : 0.95 - index * 0.03,
    y: isTop ? 0 : index * 8,
  };

  return (
    <motion.div
      className="absolute inset-4 bg-black shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing rounded-2xl"
      style={cardStyle}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: cardStyle.scale, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
        
        {/* Name and Verification - Above buttons */}
        <div className="absolute bottom-24 left-4 right-4 lg:bottom-20">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-white">{member.name}</h2>
            <CheckAnimation className="w-6 h-6" />
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
            <div className="flex flex-wrap gap-2">
              {hobbies.slice(0, 6).map((hobby, idx) => (
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
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