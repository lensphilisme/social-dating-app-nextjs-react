export interface ProfileCompletionData {
  totalFields: number;
  completedFields: number;
  completionPercentage: number;
  missingFields: string[];
}

export function calculateProfileCompletion(member: any): ProfileCompletionData {
  const fields = [
    // Basic Info
    { key: 'firstName', name: 'First Name', required: true },
    { key: 'lastName', name: 'Last Name', required: true },
    { key: 'dateOfBirth', name: 'Date of Birth', required: true },
    { key: 'gender', name: 'Gender', required: true },
    { key: 'description', name: 'Description', required: true },
    { key: 'image', name: 'Profile Picture', required: true },
    
    // Location
    { key: 'city', name: 'City', required: true },
    { key: 'country', name: 'Country', required: true },
    { key: 'state', name: 'State', required: false },
    { key: 'countryOfBirth', name: 'Country of Birth', required: false },
    
    // Spiritual
    { key: 'baptismStatus', name: 'Baptism Status', required: true },
    { key: 'baptismDate', name: 'Baptism Date', required: false },
    { key: 'congregation', name: 'Congregation', required: true },
    { key: 'meetingAttendance', name: 'Meeting Attendance', required: true },
    { key: 'fieldService', name: 'Field Service', required: true },
    { key: 'moralIntegrity', name: 'Moral Integrity', required: true },
    
    // Lifestyle
    { key: 'education', name: 'Education', required: false },
    { key: 'profession', name: 'Profession', required: false },
    { key: 'languages', name: 'Languages', required: false },
    { key: 'hobbies', name: 'Hobbies', required: false },
    
    // Goals
    { key: 'maritalGoals', name: 'Marital Goals', required: true },
    { key: 'childrenPreference', name: 'Children Preference', required: true },
    { key: 'spiritualExpectations', name: 'Spiritual Expectations', required: true },
    { key: 'spiritualStatement', name: 'Spiritual Statement', required: false },
    { key: 'favoriteScripture', name: 'Favorite Scripture', required: false },
    { key: 'spiritualAchievements', name: 'Spiritual Achievements', required: false },
    { key: 'spiritualGoals', name: 'Spiritual Goals', required: false }
  ];

  let completedFields = 0;
  const missingFields: string[] = [];

  fields.forEach(field => {
    const value = member[field.key];
    const hasValue = value !== null && value !== undefined && value !== '';
    
    if (hasValue) {
      completedFields++;
    } else if (field.required) {
      missingFields.push(field.name);
    }
  });

  const totalFields = fields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return {
    totalFields,
    completedFields,
    completionPercentage,
    missingFields
  };
}

export function getCompletionMessage(percentage: number): string {
  if (percentage === 100) {
    return 'Profile Complete! 🎉';
  } else if (percentage >= 90) {
    return 'Almost there! Just a few more details.';
  } else if (percentage >= 75) {
    return 'Great progress! Keep going.';
  } else if (percentage >= 50) {
    return 'Halfway there! Add more details.';
  } else if (percentage >= 25) {
    return 'Getting started! Complete your profile.';
  } else {
    return 'Just getting started! Add your details.';
  }
}

export function getCompletionColor(percentage: number): string {
  if (percentage === 100) return 'text-green-600';
  if (percentage >= 75) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  if (percentage >= 25) return 'text-orange-600';
  return 'text-red-600';
}
