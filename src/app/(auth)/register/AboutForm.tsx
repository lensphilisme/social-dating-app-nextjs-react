'use client';

import { Textarea } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

export default function AboutForm() {
  const {
    register,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();

  const description = watch('description');
  const spiritualStatement = watch('spiritualStatement');

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">About You</h2>
        <p className="text-sm text-gray-600">Tell us about yourself and your spiritual journey</p>
      </div>

      <Textarea
        defaultValue={getValues('description')}
        label="About Me"
        placeholder="Tell us about yourself, your personality, interests, and what makes you unique..."
        variant="bordered"
        minRows={4}
        maxRows={6}
        {...register('description')}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message as string}
      />

      <div className="text-sm text-gray-500">
        {description ? `${description.length}/500 characters` : '0/500 characters'}
      </div>

      <Textarea
        defaultValue={getValues('spiritualStatement')}
        label="Spiritual Statement"
        placeholder="Share your spiritual journey, how you came to know Jehovah, and what your faith means to you..."
        variant="bordered"
        minRows={4}
        maxRows={6}
        {...register('spiritualStatement')}
        isInvalid={!!errors.spiritualStatement}
        errorMessage={errors.spiritualStatement?.message as string}
      />

      <div className="text-sm text-gray-500">
        {spiritualStatement ? `${spiritualStatement.length}/500 characters` : '0/500 characters'}
      </div>
    </div>
  );
}

