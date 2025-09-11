'use client';

import { registerUser } from '@/app/actions/authActions';
import { RegisterSchema, profileSchema, registerSchema } from '@/lib/schemas/registerSchema';
import { handleFormServerErrors } from '@/lib/util';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { GiPadlock } from 'react-icons/gi';
import { z } from 'zod';
import ProfileForm from './ProfileForm';
import UserDetailsForm from './UserDetailsForm';
import BasicInfoForm from './BasicInfoForm';
import LocationForm from './LocationForm';
import SpiritualForm from './SpiritualForm';
import AboutForm from './AboutForm';
import GoalsForm from './GoalsForm';
import LifestyleForm from './LifestyleForm';
import SpiritualIcebreakersForm from './SpiritualIcebreakersForm';

// Create step schemas for multi-step registration
const referralSchema = registerSchema; // First step: referral code + basic user info
const basicInfoSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Please select your gender' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const locationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  countryOfBirth: z.string().optional(),
});

const spiritualSchema = z.object({
  baptismDate: z.string().min(1, 'Baptism date is required'),
  baptismStatus: z.enum(['BAPTIZED', 'INACTIVE', 'NEEDS_ENCOURAGEMENT'], { required_error: 'Please select your baptism status' }),
  meetingAttendance: z.enum(['REGULAR', 'OCCASIONAL', 'RARELY'], { required_error: 'Please select your meeting attendance' }),
  fieldService: z.enum(['ACTIVE', 'OCCASIONAL', 'INACTIVE'], { required_error: 'Please select your field service activity' }),
  congregation: z.string().min(1, 'Congregation is required'),
  moralIntegrity: z.boolean().default(true),
});

const aboutSchema = z.object({
  description: z.string().min(50, 'Please write at least 50 characters about yourself'),
  spiritualStatement: z.string().min(20, 'Please write at least 20 characters about your spiritual journey'),
});

const goalsSchema = z.object({
  maritalGoals: z.enum(['MARRIAGE_ONLY', 'SPIRITUAL_GROWTH', 'FAMILY_FOCUSED'], { required_error: 'Please select your marital goals' }),
  childrenPreference: z.enum(['WANT_CHILDREN', 'MAYBE', 'PREFER_NONE'], { required_error: 'Please select your children preference' }),
  spiritualExpectations: z.string().min(20, 'Please describe your spiritual expectations'),
});

const lifestyleSchema = z.object({
  education: z.string().min(1, 'Education level is required'),
  profession: z.string().min(1, 'Profession is required'),
  languages: z.string().min(1, 'Languages spoken is required'),
  hobbies: z.string().min(1, 'Hobbies and interests are required'),
});

const spiritualIcebreakersSchema = z.object({
  favoriteScripture: z.string().min(1, 'Favorite scripture is required'),
  spiritualAchievements: z.string().min(1, 'Spiritual achievements are required'),
  spiritualGoals: z.string().min(1, 'Spiritual goals are required'),
});

const stepSchemas = [
  referralSchema,
  basicInfoSchema,
  locationSchema,
  spiritualSchema,
  aboutSchema,
  goalsSchema,
  lifestyleSchema,
  spiritualIcebreakersSchema
];

export default function RegisterForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const currentValidationSchema = stepSchemas[activeStep];

  // Get referral code from sessionStorage
  const referralCode = typeof window !== 'undefined' ? sessionStorage.getItem('validReferralCode') : '';

  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(currentValidationSchema),
    mode: 'onTouched',
    defaultValues: {
      referralCode: referralCode || '',
    },
  });

  const {
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  const onSubmit = async () => {
    const result = await registerUser(getValues());

    if (result.status === 'success') {
      router.push('/register/success');
    } else {
      handleFormServerErrors(result, setError);
    }
  };

  const stepTitles = [
    'Access Code & Account',
    'Basic Information',
    'Location Details', 
    'Spiritual Journey',
    'About You',
    'Relationship Goals',
    'Lifestyle & Interests',
    'Spiritual Icebreakers'
  ];

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserDetailsForm />;
      case 1:
        return <BasicInfoForm />;
      case 2:
        return <LocationForm />;
      case 3:
        return <SpiritualForm />;
      case 4:
        return <AboutForm />;
      case 5:
        return <GoalsForm />;
      case 6:
        return <LifestyleForm />;
      case 7:
        return <SpiritualIcebreakersForm />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const onBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onNext = async () => {
    if (activeStep === stepSchemas.length - 1) {
      await onSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <Card className='w-2/5 mx-auto'>
      <CardHeader className='flex flex-col items-center justify-center'>
        <div className='flex flex-col gap-2 items-center text-secondary'>
          <div className='flex flex-row items-center gap-3'>
            <GiPadlock size={30} />
            <h1 className='text-3xl font-semibold'>Register</h1>
          </div>
          <p className='text-neutral-500'>Welcome to NextMatch</p>
          <div className='flex items-center gap-2 mt-2'>
            <span className='text-sm text-gray-600'>Step {activeStep + 1} of {stepSchemas.length}</span>
            <span className='text-sm font-medium text-primary'>{stepTitles[activeStep]}</span>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onNext)}>
            <div className='space-y-4'>
              {getStepContent(activeStep)}
              {errors.root?.serverError && (
                <p className='text-danger text-sm'>{errors.root.serverError.message}</p>
              )}
              <div className='flex flex-row items-center gap-6'>
                {activeStep !== 0 && (
                  <Button onClick={onBack} fullWidth>
                    Back
                  </Button>
                )}
                <Button
                  isLoading={isSubmitting}
                  isDisabled={!isValid}
                  fullWidth
                  color='secondary'
                  type='submit'
                >
                  {activeStep === stepSchemas.length - 1 ? 'Submit' : 'Continue'}
                </Button>
              </div>
              <div className='text-center mt-4'>
                <span className='text-gray-600 text-sm'>Already have an account? </span>
                <Link href='/login' className='text-purple-600 hover:text-purple-700 font-semibold text-sm hover:underline'>
                  Login here
                </Link>
              </div>
            </div>
          </form>
        </FormProvider>
      </CardBody>
    </Card>
  );
}
