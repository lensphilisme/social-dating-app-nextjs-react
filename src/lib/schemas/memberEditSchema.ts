import { z } from 'zod';

export const memberEditSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  description: z.string().min(1, {
    message: 'Description is required',
  }),
  city: z.string().min(1, {
    message: 'City is required',
  }),
  country: z.string().min(1, {
    message: 'Country is required',
  }),
  state: z.string().optional(),
  countryOfBirth: z.string().optional(),
  baptismDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  dateOfBirth: z.string().optional(),
  // JW Faith Dating Fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  congregation: z.string().optional(),
  baptismStatus: z.enum(['BAPTIZED', 'INACTIVE', 'NEEDS_ENCOURAGEMENT']).optional(),
  meetingAttendance: z.enum(['REGULAR', 'OCCASIONAL', 'RARELY']).optional(),
  fieldService: z.enum(['ACTIVE', 'OCCASIONAL', 'INACTIVE']).optional(),
  spiritualStatement: z.string().optional(),
  moralIntegrity: z.boolean().optional(),
  maritalGoals: z.enum(['MARRIAGE_ONLY', 'SPIRITUAL_GROWTH', 'FAMILY_FOCUSED']).optional(),
  spiritualExpectations: z.string().optional(),
  childrenPreference: z.enum(['WANT_CHILDREN', 'MAYBE', 'PREFER_NONE']).optional(),
  hobbies: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  languages: z.string().optional(),
  favoriteScripture: z.string().optional(),
  spiritualAchievements: z.string().optional(),
  spiritualGoals: z.string().optional(),
});

export type MemberEditSchema = z.infer<typeof memberEditSchema>;
