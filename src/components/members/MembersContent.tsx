'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { getMembers } from '@/app/actions/memberActions';
import { Member } from '@prisma/client';
import { calculateAge, transformImageUrl } from '@/lib/util';

// Using the Prisma Member type from imports

interface FilterState {
  search: string;
  ageRange: [number, number];
  location: string;
  country: string;
  state: string;
  birthYear: string;
  isOnline: boolean;
  isVerified: boolean;
  sortBy: 'newest' | 'oldest' | 'age' | 'distance';
}

export default function MembersContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [likedMembers, setLikedMembers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    ageRange: [18, 65],
    location: '',
    country: '',
    state: '',
    birthYear: '',
    isOnline: false,
    isVerified: false,
    sortBy: 'newest'
  });

  // Fetch real data from database
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const searchParams = {
          ageRange: `${filters.ageRange[0]},${filters.ageRange[1]}`,
          gender: 'male,female',
          orderBy: filters.sortBy === 'newest' ? 'updated' : filters.sortBy === 'oldest' ? 'created' : 'dateOfBirth',
          pageNumber: '1',
          pageSize: '50',
          withPhoto: 'true'
        };
        
        const response = await getMembers(searchParams);
        setMembers(response.items);
        setFilteredMembers(response.items);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = members.filter(member => {
      const age = calculateAge(member.dateOfBirth);
      const hobbies = member.hobbies ? member.hobbies.split(',').map(h => h.trim()) : [];
      
      // Search filter
      if (filters.search && !member.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !member.description?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !hobbies.some(hobby => hobby.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }

      // Age filter
      if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
        return false;
      }

      // Location filter
      if (filters.location && !member.city?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Country filter
      if (filters.country && member.country !== filters.country) {
        return false;
      }

      // State filter
      if (filters.state && member.state !== filters.state) {
        return false;
      }

      // Birth year filter
      if (filters.birthYear && !member.dateOfBirth.toISOString().startsWith(filters.birthYear)) {
        return false;
      }

      // Online filter (mock for now - you can implement real online status)
      if (filters.isOnline) {
        // For now, assume all members are online
        return true;
      }

      // Verified filter (mock for now - you can implement real verification)
      if (filters.isVerified) {
        // For now, assume all members are verified
        return true;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'age':
          return calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth);
        case 'oldest':
          return new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
        case 'newest':
        default:
          return new Date(a.updated).getTime() - new Date(b.updated).getTime();
      }
    });

    setFilteredMembers(filtered);
  }, [members, filters]);

  const handleLike = (memberId: string) => {
    setLikedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      ageRange: [18, 65],
      location: '',
      country: '',
      state: '',
      birthYear: '',
      isOnline: false,
      isVerified: false,
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value[0] !== 18 || value[1] !== 65 : 
    typeof value === 'string' ? value !== '' && value !== 'newest' :
    typeof value === 'boolean' ? value === true : false
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-neutral-900">Members</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-neutral-200 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={filters.ageRange[0]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        ageRange: [parseInt(e.target.value), prev.ageRange[1]] 
                      }))}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={filters.ageRange[1]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        ageRange: [prev.ageRange[0], parseInt(e.target.value)] 
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Country</label>
                  <select
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Countries</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                {/* Birth Year */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Birth Year</label>
                  <select
                    value={filters.birthYear}
                    onChange={(e) => setFilters(prev => ({ ...prev, birthYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 50 }, (_, i) => 2024 - i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="age">Age (Low to High)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Filters */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isOnline}
                    onChange={(e) => setFilters(prev => ({ ...prev, isOnline: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">Online Only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isVerified}
                    onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">Verified Only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="px-4 py-3 bg-white border-b border-neutral-200">
        <p className="text-sm text-neutral-600">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Members Grid */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No members found</h3>
            <p className="text-neutral-600">Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => window.location.href = `/members/${member.userId}`}
              >
                <div className="relative">
                  <img
                    src={transformImageUrl(member.image) || '/images/user.png'}
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    {/* Online status - you can implement real online status later */}
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    {/* Verification status - you can implement real verification later */}
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(member.userId);
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    {likedMembers.has(member.userId) ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-neutral-600" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-neutral-900">{member.name}</h3>
                    <span className="text-sm text-neutral-500">{calculateAge(member.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {member.city}, {member.country}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
