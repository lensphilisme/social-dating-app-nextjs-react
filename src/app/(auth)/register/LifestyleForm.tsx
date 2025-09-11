'use client';

import { Input, Textarea } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

export default function LifestyleForm() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Lifestyle & Interests</h2>
        <p className="text-sm text-gray-600">Tell us about your lifestyle and interests</p>
      </div>

      <Input
        defaultValue={getValues('education')}
        label="Education Level"
        placeholder="e.g., High School, Bachelor Degree, Masters, etc."
        variant="bordered"
        {...register('education')}
        isInvalid={!!errors.education}
        errorMessage={errors.education?.message as string}
      />

      <Input
        defaultValue={getValues('profession')}
        label="Profession/Occupation"
        placeholder="e.g., Teacher, Engineer, Nurse, etc."
        variant="bordered"
        {...register('profession')}
        isInvalid={!!errors.profession}
        errorMessage={errors.profession?.message as string}
      />

      <Input
        defaultValue={getValues('languages')}
        label="Languages Spoken"
        placeholder="e.g., English, Spanish, French, etc."
        variant="bordered"
        {...register('languages')}
        isInvalid={!!errors.languages}
        errorMessage={errors.languages?.message as string}
      />

      <Textarea
        defaultValue={getValues('hobbies')}
        label="Hobbies & Interests"
        placeholder="Tell us about your hobbies, interests, and activities you enjoy..."
        variant="bordered"
        minRows={3}
        maxRows={5}
        {...register('hobbies')}
        isInvalid={!!errors.hobbies}
        errorMessage={errors.hobbies?.message as string}
      />
    </div>
  );
}

