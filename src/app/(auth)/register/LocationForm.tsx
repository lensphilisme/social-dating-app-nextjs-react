'use client';

import { Input } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

export default function LocationForm() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Location Details</h2>
        <p className="text-sm text-gray-600">Where are you located?</p>
      </div>

      <Input
        defaultValue={getValues('city')}
        label="City"
        placeholder="e.g., New York, Los Angeles, London, etc."
        variant="bordered"
        {...register('city')}
        isInvalid={!!errors.city}
        errorMessage={errors.city?.message as string}
      />

      <Input
        defaultValue={getValues('country')}
        label="Country"
        placeholder="e.g., United States, Canada, United Kingdom, etc."
        variant="bordered"
        {...register('country')}
        isInvalid={!!errors.country}
        errorMessage={errors.country?.message as string}
      />

      <Input
        defaultValue={getValues('state')}
        label="State/Province"
        placeholder="e.g., California, Ontario, etc."
        variant="bordered"
        {...register('state')}
        isInvalid={!!errors.state}
        errorMessage={errors.state?.message as string}
      />

      <Input
        defaultValue={getValues('countryOfBirth')}
        label="Country of Birth"
        placeholder="e.g., United States, Canada, United Kingdom, etc."
        variant="bordered"
        {...register('countryOfBirth')}
        isInvalid={!!errors.countryOfBirth}
        errorMessage={errors.countryOfBirth?.message as string}
      />
    </div>
  );
}

