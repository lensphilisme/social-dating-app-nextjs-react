'use client';

import { Input, Select, SelectItem } from '@nextui-org/react';
import { format, subYears } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { calculateAge } from '@/lib/util';

export default function BasicInfoForm() {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const gender = watch('gender');
  const dateOfBirth = watch('dateOfBirth');

  const genderList = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
  ];

  const getAgeValidationMessage = () => {
    if (!gender || !dateOfBirth) return '';
    
    const age = calculateAge(new Date(dateOfBirth));
    const isMale = gender === 'MALE';
    const minAge = isMale ? 25 : 23;
    
    if (age < minAge) {
      const yearsToWait = minAge - age;
      return `Wait till you have ${minAge} years old! You need to wait ${yearsToWait} more year${yearsToWait > 1 ? 's' : ''}.`;
    }
    
    return '';
  };

  const getMaxDate = () => {
    if (!gender) return format(subYears(new Date(), 18), 'yyyy-MM-dd');
    
    const isMale = gender === 'MALE';
    const minAge = isMale ? 25 : 23;
    return format(subYears(new Date(), minAge), 'yyyy-MM-dd');
  };

  return (
    <div className='space-y-4'>
      <div className='text-center mb-4'>
        <h2 className='text-xl font-semibold text-gray-800'>Basic Information</h2>
        <p className='text-sm text-gray-600'>Tell us about yourself</p>
      </div>

      <Select
        defaultSelectedKeys={getValues('gender') ? [getValues('gender')] : []}
        label='Gender'
        placeholder='Select your gender'
        variant='bordered'
        {...register('gender')}
        isInvalid={!!errors.gender}
        errorMessage={errors.gender?.message as string}
        onChange={(e) => setValue('gender', e.target.value)}
      >
        {genderList.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        defaultValue={getValues('dateOfBirth')}
        label='Date of Birth'
        max={getMaxDate()}
        type='date'
        variant='bordered'
        {...register('dateOfBirth')}
        isInvalid={!!errors.dateOfBirth}
        errorMessage={errors.dateOfBirth?.message as string || getAgeValidationMessage()}
      />

      <Input
        defaultValue={getValues('firstName')}
        label='First Name'
        variant='bordered'
        {...register('firstName')}
        isInvalid={!!errors.firstName}
        errorMessage={errors.firstName?.message as string}
      />

      <Input
        defaultValue={getValues('lastName')}
        label='Last Name'
        variant='bordered'
        {...register('lastName')}
        isInvalid={!!errors.lastName}
        errorMessage={errors.lastName?.message as string}
      />

      <Input
        defaultValue={getValues('username')}
        label='Username (Display Name)'
        variant='bordered'
        placeholder='Choose a unique username'
        {...register('username')}
        isInvalid={!!errors.username}
        errorMessage={errors.username?.message as string}
      />


      <Input
        defaultValue={getValues('email')}
        label='Email'
        type='email'
        variant='bordered'
        {...register('email')}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message as string}
      />

      <Input
        defaultValue={getValues('password')}
        label='Password'
        type='password'
        variant='bordered'
        {...register('password')}
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message as string}
      />
    </div>
  );
}
