import { z } from 'zod';
import { calculateAge } from '../util';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
  referralCode: z.string().min(1, 'Referral code is required'),
});

export const profileSchema = z.object({
  // Basic Information
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Please select your gender',
  }),
  dateOfBirth: z
    .string()
    .min(1, {
      message: 'Date of birth is required',
    }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  timerSeconds: z.number().min(3).max(60).default(10),
  
  // Location
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  countryOfBirth: z.string().optional(),
  
  // Spiritual Journey
  baptismDate: z
    .string()
    .min(1, 'Baptism date is required'),
  baptismStatus: z.enum(['BAPTIZED', 'INACTIVE', 'NEEDS_ENCOURAGEMENT'], {
    required_error: 'Please select your baptism status',
  }),
  meetingAttendance: z.enum(['REGULAR', 'OCCASIONAL', 'RARELY'], {
    required_error: 'Please select your meeting attendance',
  }),
  fieldService: z.enum(['ACTIVE', 'OCCASIONAL', 'INACTIVE'], {
    required_error: 'Please select your field service activity',
  }),
  congregation: z.string().min(1, 'Congregation is required'),
  moralIntegrity: z.boolean().default(true),
  
  // About & Description
  description: z.string().min(50, 'Please write at least 50 characters about yourself'),
  spiritualStatement: z.string().min(20, 'Please write at least 20 characters about your spiritual journey'),
  
  // Relationship Goals
  maritalGoals: z.enum(['MARRIAGE_ONLY', 'SPIRITUAL_GROWTH', 'FAMILY_FOCUSED'], {
    required_error: 'Please select your marital goals',
  }),
  childrenPreference: z.enum(['WANT_CHILDREN', 'MAYBE', 'PREFER_NONE'], {
    required_error: 'Please select your children preference',
  }),
  spiritualExpectations: z.string().min(20, 'Please describe your spiritual expectations'),
  
  // Lifestyle & Interests
  education: z.string().min(1, 'Education level is required'),
  profession: z.string().min(1, 'Profession is required'),
  languages: z.string().min(1, 'Languages spoken is required'),
  hobbies: z.string().min(1, 'Hobbies and interests are required'),
  
  // Spiritual Icebreakers
  favoriteScripture: z.string().min(1, 'Favorite scripture is required'),
  spiritualAchievements: z.string().min(1, 'Spiritual achievements are required'),
  spiritualGoals: z.string().min(1, 'Spiritual goals are required'),
});

export const combinedRegisterSchema = registerSchema.and(profileSchema).refine(
  (data) => {
    const age = calculateAge(new Date(data.dateOfBirth));
    const isMale = data.gender === 'MALE';
    const minAge = isMale ? 25 : 23;
    
    if (age < minAge) {
      return false;
    }
    return true;
  },
  {
    message: 'Age requirement not met',
    path: ['dateOfBirth'],
  }
).refine(
  (data) => {
    const baptismDate = new Date(data.baptismDate);
    const today = new Date();
    const yearsSinceBaptism = (today.getTime() - baptismDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return yearsSinceBaptism >= 2;
  },
  {
    message: 'You must be baptized for at least 2 years to register',
    path: ['baptismDate'],
  }
);

export type ProfileSchema = z.infer<typeof profileSchema>;

export type RegisterSchema = z.infer<typeof registerSchema & typeof profileSchema>;
