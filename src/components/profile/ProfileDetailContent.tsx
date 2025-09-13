'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldUploadButton, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { trackProfileView } from '@/app/actions/profileViewActions';
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
import UserActionsMenu from './UserActionsMenu';
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
  const [referralNetwork, setReferralNetwork] = useState<any>(null);
  const router = useRouter();
  const { data: session } = useSession();
  
  const isOwnProfile = session?.user?.id === member.userId;

  useEffect(() => {
    fetchAllData();
    
    // Track profile view for other users
    if (!isOwnProfile && member?.userId) {
      trackProfileView(member.userId);
    }
  }, [isOwnProfile, member.userId]);

  const fetchAllData = async () => {
    try {
      if (isOwnProfile) {
        // For own profile, fetch member data and referral network
        const [memberResponse, referralResponse] = await Promise.all([
          fetch('/api/members/me'),
          fetch('/api/referral/network')
        ]);

        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          setMemberData(memberData);
        }

        if (referralResponse.ok) {
          const referralData = await referralResponse.json();
          setReferralNetwork(referralData.data);
        }
      } else {
        // For other users, fetch all data in one request
        const response = await fetch(`/api/members/${member.userId}`);
        if (response.ok) {
          const data = await response.json();
          setMemberData(data);
          setReferralNetwork(data.referralNetwork);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFieldUpdate = async (field: string, value: string | boolean) => {
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
        setMemberData(prev => ({
          ...prev,
          [field]: value
        }));
        // Also update the main member object for display
        (member as any)[field] = value;
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
        // Also update the main member object
        (member as any).referralCode = data.referralCode;
        // Refresh all data
        await fetchAllData();
        alert('New referral code generated successfully!');
      } else {
        throw new Error('Failed to regenerate referral code');
      }
    } catch (error) {
      console.error('Error regenerating referral code:', error);
      alert('Failed to regenerate referral code');
    }
  };

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(memberData.referralCode || '');
      alert('Referral code copied to clipboard!');
    } catch (error) {
      console.error('Error copying referral code:', error);
      alert('Failed to copy referral code');
    }
  };

  const handleProfilePhotoUpload = async (result: CloudinaryUploadWidgetResults) => {
    try {
      if (!result.info || typeof result.info === 'string') return;
      
      const imageUrl = result.info.secure_url;
      
      // Update the member's profile image
      const response = await fetch('/api/members/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrl
        }),
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setMemberData(prev => ({
          ...prev,
          image: imageUrl
        }));
        // Also update the main member object
        (member as any).image = imageUrl;
        alert('Profile photo updated successfully!');
        // Refresh the page to ensure all components show the updated image
        router.refresh();
      } else {
        alert('Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      alert('Error updating profile photo');
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
    // Missing Fields - For own profile only
    ...(isOwnProfile ? [{
      id: 'missing',
      title: 'Complete Your Profile',
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

    // Media Gallery - First for own profile
    ...(isOwnProfile ? [{
      id: 'media',
      title: 'Media Gallery',
      icon: PhotoIcon,
      content: (
        <div>
          <MediaGallery onMediaUpdate={() => {
            // Media updated successfully
            console.log('Media updated');
          }} />
        </div>
      )
    }] : []),
    
    // Referral Network - For own profile (full access)
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
                {referralNetwork?.referralCode || memberData.referralCode || 'Not available'}
              </p>
              <button
                onClick={handleCopyReferralCode}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                title="Copy referral code"
              >
                Copy
              </button>
              <button
                onClick={handleRegenerateReferralCode}
                className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Generate New
              </button>
            </div>
          </div>
          {referralNetwork?.referredBy && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Referred By</label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 font-medium">{referralNetwork.referredBy.name}</p>
                <p className="text-green-600 text-sm">Code: {referralNetwork.referredBy.referralCode}</p>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-neutral-600">People Referred</label>
            <p className="text-neutral-900 mb-2">{referralNetwork?.referralCount || 0} people</p>
            
            {referralNetwork?.referredUsers && referralNetwork.referredUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-600">Your Referrals:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {referralNetwork.referredUsers.map((user: any) => (
                    <div key={user.id} className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-blue-800 font-medium text-sm">{user.name}</p>
                      <p className="text-blue-600 text-xs">Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }] : []),

    // Referral Network - For other users (limited access - only show who referred them)
    ...(!isOwnProfile && referralNetwork?.referredBy ? [{
      id: 'referral',
      title: 'Referral Network',
      icon: LinkIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Referred By</label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 font-medium">{referralNetwork.referredBy.name}</p>
              <p className="text-green-600 text-sm">Code: {referralNetwork.referredBy.referralCode}</p>
            </div>
          </div>
        </div>
      )
    }] : []),


    {
      id: 'about',
      title: `About ${memberData.firstName} ${memberData.lastName}`,
      icon: UserIcon,
      content: (
        <div className="space-y-4">
          <InlineEditField
            label="Personal Description"
            value={memberData.description}
            type="textarea"
            placeholder="Tell us about yourself..."
            onSave={(value) => handleFieldUpdate('description', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Spiritual Statement"
            value={memberData.spiritualStatement}
            type="textarea"
            placeholder="Share your spiritual journey..."
            onSave={(value) => handleFieldUpdate('spiritualStatement', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="What I'm Looking For"
            value={memberData.spiritualExpectations}
            type="textarea"
            placeholder="Describe what you're looking for in a partner..."
            onSave={(value) => handleFieldUpdate('spiritualExpectations', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
        </div>
      )
    },
    {
      id: 'basic',
      title: 'Basic Information',
      icon: UserIcon,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InlineEditField
            label="First Name"
            value={memberData.firstName}
            placeholder="Enter your first name"
            onSave={(value) => handleFieldUpdate('firstName', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Last Name"
            value={memberData.lastName}
            placeholder="Enter your last name"
            onSave={(value) => handleFieldUpdate('lastName', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <div>
            <label className="text-sm font-medium text-neutral-600">Full Name</label>
            <p className="text-neutral-900">{memberData.firstName} {memberData.lastName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-600">Age</label>
            <p className="text-neutral-900">{calculateAge(memberData.dateOfBirth)} years old</p>
          </div>
          <InlineEditField
            label="Gender"
            value={memberData.gender}
            type="select"
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' }
            ]}
            onSave={(value) => handleFieldUpdate('gender', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Date of Birth"
            value={memberData.dateOfBirth ? new Date(memberData.dateOfBirth).toISOString().split('T')[0] : ''}
            type="date"
            onSave={(value) => handleFieldUpdate('dateOfBirth', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="City"
            value={memberData.city}
            placeholder="Enter your city"
            onSave={(value) => handleFieldUpdate('city', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Country"
            value={memberData.country}
            placeholder="Enter your country"
            onSave={(value) => handleFieldUpdate('country', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="State/Province"
            value={memberData.state}
            placeholder="Enter your state/province"
            onSave={(value) => handleFieldUpdate('state', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Country of Birth"
            value={memberData.countryOfBirth}
            placeholder="Enter your country of birth"
            onSave={(value) => handleFieldUpdate('countryOfBirth', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Congregation"
            value={memberData.congregation}
            placeholder="Enter your congregation"
            onSave={(value) => handleFieldUpdate('congregation', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
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
            <InlineEditField
              label="Baptism Status"
              value={memberData.baptismStatus}
              type="select"
              options={[
                { value: 'BAPTIZED', label: 'Baptized' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'NEEDS_ENCOURAGEMENT', label: 'Needs Encouragement' }
              ]}
              onSave={(value) => handleFieldUpdate('baptismStatus', value)}
              className={isOwnProfile ? '' : 'pointer-events-none'}
            />
            <InlineEditField
              label="Baptism Date"
              value={memberData.baptismDate ? new Date(memberData.baptismDate).toISOString().split('T')[0] : ''}
              type="date"
              onSave={(value) => handleFieldUpdate('baptismDate', value)}
              className={isOwnProfile ? '' : 'pointer-events-none'}
            />
            <InlineEditField
              label="Meeting Attendance"
              value={memberData.meetingAttendance}
              type="select"
              options={[
                { value: 'REGULAR', label: 'Regular' },
                { value: 'OCCASIONAL', label: 'Occasional' },
                { value: 'RARELY', label: 'Rarely' }
              ]}
              onSave={(value) => handleFieldUpdate('meetingAttendance', value)}
              className={isOwnProfile ? '' : 'pointer-events-none'}
            />
            <InlineEditField
              label="Field Service"
              value={memberData.fieldService}
              type="select"
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'OCCASIONAL', label: 'Occasional' },
                { value: 'INACTIVE', label: 'Inactive' }
              ]}
              onSave={(value) => handleFieldUpdate('fieldService', value)}
              className={isOwnProfile ? '' : 'pointer-events-none'}
            />
          </div>
          
          <InlineEditField
            label="Favorite Scripture"
            value={memberData.favoriteScripture}
            type="textarea"
            placeholder="Share your favorite scripture..."
            onSave={(value) => handleFieldUpdate('favoriteScripture', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          
          <InlineEditField
            label="Spiritual Achievements"
            value={memberData.spiritualAchievements}
            type="textarea"
            placeholder="Share your spiritual achievements..."
            onSave={(value) => handleFieldUpdate('spiritualAchievements', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          
          <InlineEditField
            label="Spiritual Goals"
            value={memberData.spiritualGoals}
            type="textarea"
            placeholder="Share your spiritual goals..."
            onSave={(value) => handleFieldUpdate('spiritualGoals', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          
          <InlineEditField
            label="Moral Integrity"
            value={memberData.moralIntegrity ? 'Yes' : 'No'}
            type="select"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
            onSave={(value) => handleFieldUpdate('moralIntegrity', value === 'true')}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
        </div>
      )
    },
    {
      id: 'education',
      title: 'Education & Career',
      icon: AcademicCapIcon,
      content: (
        <div className="space-y-4">
          <InlineEditField
            label="Education"
            value={memberData.education}
            placeholder="Enter your education level"
            onSave={(value) => handleFieldUpdate('education', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Profession"
            value={memberData.profession}
            placeholder="Enter your profession"
            onSave={(value) => handleFieldUpdate('profession', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
        </div>
      )
    },
    {
      id: 'languages',
      title: 'Languages & Hobbies',
      icon: LanguageIcon,
      content: (
        <div className="space-y-4">
          <InlineEditField
            label="Languages"
            value={memberData.languages}
            placeholder="Enter languages you speak"
            onSave={(value) => handleFieldUpdate('languages', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Hobbies & Interests"
            value={memberData.hobbies}
            type="textarea"
            placeholder="Enter your hobbies and interests (comma separated)"
            onSave={(value) => handleFieldUpdate('hobbies', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          {memberData.hobbies && (
            <div className="flex flex-wrap gap-2 mt-2">
              {memberData.hobbies.split(',').map((hobby, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {hobby.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Marriage Goals',
      icon: HeartIcon,
      content: (
        <div className="space-y-3">
          <InlineEditField
            label="Marital Goals"
            value={memberData.maritalGoals}
            type="select"
            options={[
              { value: 'MARRIAGE_ONLY', label: 'Marriage Only' },
              { value: 'SPIRITUAL_GROWTH', label: 'Spiritual Growth' },
              { value: 'FAMILY_FOCUSED', label: 'Family Focused' }
            ]}
            onSave={(value) => handleFieldUpdate('maritalGoals', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
          <InlineEditField
            label="Children Preference"
            value={memberData.childrenPreference}
            type="select"
            options={[
              { value: 'WANT_CHILDREN', label: 'Want Children' },
              { value: 'MAYBE', label: 'Maybe' },
              { value: 'PREFER_NONE', label: 'Prefer None' }
            ]}
            onSave={(value) => handleFieldUpdate('childrenPreference', value)}
            className={isOwnProfile ? '' : 'pointer-events-none'}
          />
        </div>
      )
    }
  ];

  // For other users, add media gallery and referral info
  if (!isOwnProfile) {
    // Add media gallery for other users (view-only)
    sections.unshift({
      id: 'media',
      title: 'Media Gallery',
      icon: PhotoIcon,
      content: (
        <div>
          <MediaGallery userId={member.userId} />
        </div>
      )
    });

    // Add referral info if available
    if (member.referredBy || member.referredUsers?.length) {
      sections.push({
        id: 'referral',
        title: 'Referral Network',
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
  }

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-16 pb-16 lg:pb-0">
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
              <CldUploadButton
              options={{ maxFiles: 1 }}
              onSuccess={handleProfilePhotoUpload}
              signatureEndpoint='/api/sign-image'
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
            >
                <PhotoIcon className="w-3 h-3" />
              </CldUploadButton>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900">{memberData.firstName} {memberData.lastName}</h2>
            <p className="text-neutral-600">{calculateAge(memberData.dateOfBirth)} years old</p>
            <p className="text-neutral-600">{memberData.city}, {memberData.country}</p>
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
          <div className="mb-6 flex justify-end">
            <UserActionsMenu 
              memberId={member.id}
              userId={member.userId}
              userName={member.name}
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