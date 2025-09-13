'use client';

import { useState, useEffect } from 'react';
import { updateUserDetails, updateMemberDetails } from '@/app/actions/adminSystemActions';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
    profileComplete: false
  });
  const [memberData, setMemberData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    country: '',
    description: '',
    profession: '',
    education: '',
    hobbies: '',
    languages: '',
    spiritualGoals: '',
    spiritualStatement: '',
    favoriteScripture: '',
    spiritualAchievements: '',
    spiritualExpectations: '',
    maritalGoals: '',
    childrenPreference: '',
    baptismStatus: '',
    baptismDate: '',
    congregation: '',
    meetingAttendance: '',
    fieldService: '',
    moralIntegrity: '',
    countryOfBirth: '',
    state: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'MEMBER',
        profileComplete: user.profileComplete || false
      });

      if (user.member) {
        setMemberData({
          firstName: user.member.firstName || '',
          lastName: user.member.lastName || '',
          dateOfBirth: user.member.dateOfBirth ? new Date(user.member.dateOfBirth).toISOString().split('T')[0] : '',
          gender: user.member.gender || '',
          city: user.member.city || '',
          country: user.member.country || '',
          description: user.member.description || '',
          profession: user.member.profession || '',
          education: user.member.education || '',
          hobbies: user.member.hobbies || '',
          languages: user.member.languages || '',
          spiritualGoals: user.member.spiritualGoals || '',
          spiritualStatement: user.member.spiritualStatement || '',
          favoriteScripture: user.member.favoriteScripture || '',
          spiritualAchievements: user.member.spiritualAchievements || '',
          spiritualExpectations: user.member.spiritualExpectations || '',
          maritalGoals: user.member.maritalGoals || '',
          childrenPreference: user.member.childrenPreference || '',
          baptismStatus: user.member.baptismStatus || '',
          baptismDate: user.member.baptismDate ? new Date(user.member.baptismDate).toISOString().split('T')[0] : '',
          congregation: user.member.congregation || '',
          meetingAttendance: user.member.meetingAttendance || '',
          fieldService: user.member.fieldService || '',
          moralIntegrity: user.member.moralIntegrity || '',
          countryOfBirth: user.member.countryOfBirth || '',
          state: user.member.state || ''
        });
      }
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user details
      await updateUserDetails(user.id, userData);

      // Update member details if member exists
      if (user.member) {
        const memberUpdateData: any = {};
        
        // Only include fields that have values
        Object.entries(memberData).forEach(([key, value]) => {
          if (value) {
            if (key === 'dateOfBirth' || key === 'baptismDate') {
              memberUpdateData[key] = new Date(value);
            } else {
              memberUpdateData[key] = value;
            }
          }
        });

        await updateMemberDetails(user.id, memberUpdateData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user details');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit User: {user.name || user.email}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={userData.role}
                onChange={(e) => setUserData({ ...userData, role: e.target.value as 'ADMIN' | 'MEMBER' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="profileComplete"
                checked={userData.profileComplete}
                onChange={(e) => setUserData({ ...userData, profileComplete: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="profileComplete" className="ml-2 block text-sm text-gray-700">
                Profile Complete
              </label>
            </div>
          </div>

          {/* Member Details */}
          {user.member && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Member Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={memberData.firstName}
                      onChange={(e) => setMemberData({ ...memberData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={memberData.lastName}
                      onChange={(e) => setMemberData({ ...memberData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={memberData.dateOfBirth}
                      onChange={(e) => setMemberData({ ...memberData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={memberData.gender}
                      onChange={(e) => setMemberData({ ...memberData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={memberData.city}
                      onChange={(e) => setMemberData({ ...memberData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={memberData.country}
                      onChange={(e) => setMemberData({ ...memberData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={memberData.description}
                      onChange={(e) => setMemberData({ ...memberData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession
                    </label>
                    <input
                      type="text"
                      value={memberData.profession}
                      onChange={(e) => setMemberData({ ...memberData, profession: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      value={memberData.education}
                      onChange={(e) => setMemberData({ ...memberData, education: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hobbies
                    </label>
                    <input
                      type="text"
                      value={memberData.hobbies}
                      onChange={(e) => setMemberData({ ...memberData, hobbies: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    <input
                      type="text"
                      value={memberData.languages}
                      onChange={(e) => setMemberData({ ...memberData, languages: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spiritual Goals
                    </label>
                    <textarea
                      value={memberData.spiritualGoals}
                      onChange={(e) => setMemberData({ ...memberData, spiritualGoals: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spiritual Statement
                    </label>
                    <textarea
                      value={memberData.spiritualStatement}
                      onChange={(e) => setMemberData({ ...memberData, spiritualStatement: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

