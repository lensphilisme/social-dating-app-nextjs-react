'use client';

import { Input } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

export default function UserDetailsForm() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className='space-y-4'>
      <div className='text-center mb-4'>
        <h2 className='text-xl font-semibold text-gray-800'>Account Details</h2>
        <p className='text-sm text-gray-600'>Create your account information</p>
      </div>

      <Input
        defaultValue={getValues('referralCode')}
        label='Referral Code'
        variant='bordered'
        {...register('referralCode')}
        isInvalid={!!errors.referralCode}
        errorMessage={errors.referralCode?.message as string}
        readOnly
        className="bg-gray-50"
      />

      <div className='bg-green-50 p-3 rounded-lg'>
        <p className='text-sm text-green-700'>
          ✅ Referral code validated successfully!
        </p>
      </div>

      <Input
        defaultValue={getValues('email')}
        label='Email'
        variant='bordered'
        {...register('email')}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message as string}
      />
      <Input
        defaultValue={getValues('password')}
        label='Password'
        variant='bordered'
        type='password'
        {...register('password')}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message as string}
      />
    </div>
  );
}
