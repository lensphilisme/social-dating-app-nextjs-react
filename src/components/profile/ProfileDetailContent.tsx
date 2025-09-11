'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  FireIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon,
  CheckBadgeIcon,
  PhoneIcon,
  VideoCameraIcon,
  ShareIcon,
  FlagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  LinkIcon,
  PhotoIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import MemberActions from '@/app/members/[userId]/MemberActions';
import { useRouter } from 'next/navigation';
import MediaGallery from '@/components/media/MediaGallery';
import InlineEditField from './InlineEditField';
import ProfileCompletion from './ProfileCompletion';
import { useSession } from 'next-auth/react';
import { regenerateReferralCode } from '@/lib/referralUtils';

interface Member {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  description: string;
  city: string;
  country: string;
  state?: string;
  countryOfBirth?: string;
  image?: string;
  baptismStatus?: string;
  baptismDate?: Date;
  congregation?: string;
  meetingAttendance?: string;
  fieldService?: string;
  moralIntegrity?: boolean;
  maritalGoals?: string;
  childrenPreference?: string;
  spiritualExpectations?: string;
  spiritualStatement?: string;
  favoriteScripture?: string;
  spiritualAchievements?: string;
  spiritualGoals?: string;
  education?: string;
  profession?: string;
  languages?: string;
  hobbies?: string;
  userId: string;
  referralCode?: string;
  referredBy?: string;
  referredUsers?: any[];
}

interface ProfileDetailContentProps {
  member: Member;
}

export default function ProfileDetailContent({ member }: ProfileDetailContentProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['about']));
  const [isEditing, setIsEditing] = useState(false);
  const [memberData, setMemberData] = useState(member);
  const router = useRouter();
  const { data: session } = useSession();
  
  const isOwnProfile = session?.user?.id === member.userId;

  const handleFieldUpdate = async (field: string, value: string) => {
    try {
      const response = await fetch('/api/members/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value
        }),
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setMemberData(updatedMember);
      } else {
        throw new Error('Failed to update field');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  };

  const handleRegenerateReferralCode = async () => {
    try {
      const response = await fetch('/api/referral/regenerate', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setMemberData(prev => ({
          ...prev,
          referralCode: data.referralCode
        }));
        alert('New referral code generated successfully!');
      } else {
        throw new Error('Failed to regenerate referral code');
      }
    } catch (error) {
      console.error('Error regenerating referral code:', error);
      alert('Failed to regenerate referral code');
    }
  };

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

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString();
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    // Media Gallery - First for own profile
    ...(isOwnProfile ? [{
      id: 'media',
      title: 'Media Gallery',
      icon: PhotoIcon,
      content: (
        <div>
          <MediaGallery userId={member.userId} />
        </div>
      )
    }] : []),
    
    // Referral Network - At top for own profile
    ...(isOwnProfile ? [{
      id: 'referral',
      title: 'Referral Network',
      icon: LinkIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Your Referral Code</label>
            <div className="flex items-center space-x-2">
              <p className="text-neutral-900 font-mono bg-neutral-100 px-2 py-1 rounded flex-1">
                {memberData.referralCode || 'Not available'}
              </p>
              <button
                onClick={handleRegenerateReferralCode}
                className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Generate New
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Referred By</label>
            <p className="text-neutral-900">{memberData.referredBy || 'No referral'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">People Referred</label>
            <p className="text-neutral-900">
              {memberData.referredUsers?.length || 0} people
            </p>
          </div>
        </div>
      )
    }] : []),

    // Profile Completion - For own profile
    ...(isOwnProfile ? [{
      id: 'completion',
      title: 'Profile Completion',
      icon: CheckCircleIcon,
      content: (
        <div>
          <ProfileCompletion 
            member={memberData} 
            onCompleteProfile={() => setIsEditing(true)}
          />
        </div>
      )
    }] : []),

    {
      id: 'about',
      title: `About ${member.gender === 'FEMALE' ? 'Her' : 'Him'}`,
      icon: UserIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-neutral-900 mb-2">Personal Description</h4>
            <p className="text-neutral-700 leading-relaxed">
              {member.description || 'No description provided yet.'}
            </p>
          </div>
          {member.spiritualStatement && (
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Spiritual Statement</h4>
              <p className="text-neutral-700 leading-relaxed">
                {member.spiritualStatement}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'basic',
      title: 'Basic Information',
      icon: UserIcon,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Full Name</label>
            <p className="text-neutral-900">{member.firstName} {member.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Age</label>
            <p className="text-neutral-900">{calculateAge(member.dateOfBirth)} years old</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Gender</label>
            <p className="text-neutral-900">{member.gender}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Date of Birth</label>
            <p className="text-neutral-900">{formatDate(member.dateOfBirth)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Current Location</label>
            <p className="text-neutral-900">{member.city}, {member.country}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">State/Province</label>
            <p className="text-neutral-900">{member.state || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Country of Birth</label>
            <p className="text-neutral-900">{member.countryOfBirth || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Congregation</label>
            <p className="text-neutral-900">{member.congregation || 'Not specified'}</p>
          </div>
        </div>
      )
    },
    {
      id: 'spiritual',
      title: 'Spiritual Journey',
      icon: CheckBadgeIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-600">Baptism Status</label>
              <p className="text-neutral-900">{member.baptismStatus?.replace('_', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">Baptism Date</label>
              <p className="text-neutral-900">{formatDate(member.baptismDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">Meeting Attendance</label>
              <p className="text-neutral-900">{member.meetingAttendance?.replace('_', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">Field Service</label>
              <p className="text-neutral-900">{member.fieldService?.replace('_', ' ') || 'Not specified'}</p>
            </div>
          </div>
          
          {member.favoriteScripture && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Favorite Scripture</label>
              <p className="text-neutral-900 italic">"{member.favoriteScripture}"</p>
            </div>
          )}
          
          {member.spiritualAchievements && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Spiritual Achievements</label>
              <p className="text-neutral-900">{member.spiritualAchievements}</p>
            </div>
          )}
          
          {member.spiritualGoals && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Spiritual Goals</label>
              <p className="text-neutral-900">{member.spiritualGoals}</p>
            </div>
          )}
          
          {member.spiritualExpectations && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Spiritual Expectations</label>
              <p className="text-neutral-900">{member.spiritualExpectations}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-neutral-600">Moral Integrity</label>
            <p className="text-neutral-900">{member.moralIntegrity ? 'Yes' : 'Not specified'}</p>
          </div>
        </div>
      )
    },
    {
      id: 'education',
      title: 'Education & Career',
      icon: AcademicCapIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Education</label>
            <p className="text-neutral-900">{member.education || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Profession</label>
            <p className="text-neutral-900">{member.profession || 'Not specified'}</p>
          </div>
        </div>
      )
    },
    {
      id: 'languages',
      title: 'Languages & Hobbies',
      icon: LanguageIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Languages</label>
            <p className="text-neutral-900">{member.languages || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Hobbies & Interests</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.hobbies ? (
                member.hobbies.split(',').map((hobby, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {hobby.trim()}
                  </span>
                ))
              ) : (
                <p className="text-neutral-500">No hobbies specified</p>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Marriage Goals',
      icon: HeartIcon,
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-neutral-600">Marital Goals</label>
            <p className="text-neutral-900">{member.maritalGoals?.replace('_', ' ') || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Children Preference</label>
            <p className="text-neutral-900">{member.childrenPreference?.replace('_', ' ') || 'Not specified'}</p>
          </div>
        </div>
      )
    }
  ];

  // For other users, show referral info but not the code
  if (!isOwnProfile && (member.referredBy || member.referredUsers?.length)) {
    sections.push({
      id: 'referral',
      title: 'Referral Info',
      icon: LinkIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Referred By</label>
            <p className="text-neutral-900">{member.referredBy || 'No referral'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">People Referred</label>
            <p className="text-neutral-900">
              {member.referredUsers?.length || 0} people
            </p>
          </div>
        </div>
      )
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-neutral-600" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">
            {isOwnProfile ? 'My Profile' : member.name}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src={member.image || '/images/user.png'}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isOwnProfile && (
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                <PhotoIcon className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900">{member.name}</h2>
            <p className="text-neutral-600">{calculateAge(member.dateOfBirth)} years old</p>
            <p className="text-neutral-600">{member.city}, {member.country}</p>
            {member.baptismStatus && (
              <div className="flex items-center mt-1">
                <CheckBadgeIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  {member.baptismStatus.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Actions - Only show appropriate actions */}
        {!isOwnProfile && (
          <div className="mb-6">
            <MemberActions 
              memberId={member.id}
              userId={member.userId}
              isLiked={isLiked}
              onLikeChange={setIsLiked}
            />
          </div>
        )}
      </div>

      {/* Profile Sections */}
      <div className="px-4 pb-20">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const Icon = section.icon;
          
          return (
            <div key={section.id} className="mb-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-neutral-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
                )}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-neutral-50 rounded-b-xl border-l border-r border-b border-neutral-200">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}