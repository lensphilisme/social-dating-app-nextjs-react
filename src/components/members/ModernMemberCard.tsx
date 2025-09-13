'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { transformImageUrl } from '@/lib/util';
import { Member } from '@prisma/client';

interface ModernMemberCardProps {
  member: Member;
  isLiked: boolean;
  isOnline: boolean;
  isVerified: boolean;
  onLike: (userId: string) => void;
  onClick: (userId: string) => void;
  index: number;
}

export default function ModernMemberCard({
  member,
  isLiked,
  isOnline,
  isVerified,
  onLike,
  onClick,
  index
}: ModernMemberCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getDistanceText = () => {
    // Generate random distance for demo (in real app, this would come from location data)
    const distances = ['2 min away', '5 min away', '3 min away', '7 hr away', '4 hr away', '1 hr away'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(member.userId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="relative group cursor-pointer"
      onClick={() => onClick(member.userId)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
        {/* Image Container */}
        <div className="relative w-full h-full">
          <img
            src={transformImageUrl(member.image) || '/images/user.png'}
            alt={member.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            style={{
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
          
          {/* Loading Placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top Right Indicators */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {isOnline && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
              />
            )}
            {isVerified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-xs font-bold">✓</span>
              </motion.div>
            )}
          </div>

          {/* Like Button */}
          <motion.button
            onClick={handleLike}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLiked ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-white" />
            )}
          </motion.button>

          {/* Bottom Text Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-white"
            >
              {/* Name and Age */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white drop-shadow-lg">
                  {member.name}
                </h3>
                <span className="text-white/90 text-sm font-medium">
                  ({calculateAge(member.dateOfBirth)})
                </span>
              </div>
              
              {/* Location */}
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <MapPinIcon className="w-4 h-4" />
                <span className="drop-shadow-md">
                  {getDistanceText()}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/20 transition-opacity duration-200"
          />
        </div>
      </div>

      {/* Subtle Glow Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl -z-10 transition-opacity duration-300"
      />
    </motion.div>
  );
}

