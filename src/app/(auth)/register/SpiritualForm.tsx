'use client';

import { Input, Select, SelectItem, Checkbox } from '@nextui-org/react';
import { format, subYears } from 'date-fns';
import { useFormContext } from 'react-hook-form';

export default function SpiritualForm() {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const baptismDate = watch('baptismDate');

  const baptismStatusOptions = [
    { key: 'BAPTIZED', label: 'Baptized Jehovah\'s Witness' },
    { key: 'INACTIVE', label: 'Inactive' },
    { key: 'NEEDS_ENCOURAGEMENT', label: 'Needs spiritual encouragement' }
  ];

  const meetingOptions = [
    { key: 'REGULAR', label: 'Regular' },
    { key: 'OCCASIONAL', label: 'Occasional' },
    { key: 'RARELY', label: 'Rarely' }
  ];

  const fieldServiceOptions = [
    { key: 'ACTIVE', label: 'Active' },
    { key: 'OCCASIONAL', label: 'Occasional' },
    { key: 'INACTIVE', label: 'Inactive' }
  ];

  const getBaptismValidationMessage = () => {
    if (!baptismDate) return '';
    
    const baptism = new Date(baptismDate);
    const today = new Date();
    const yearsSinceBaptism = (today.getTime() - baptism.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsSinceBaptism < 2) {
      const yearsToWait = Math.ceil(2 - yearsSinceBaptism);
      return `Wait till you reach 2 years baptized! You need to wait ${yearsToWait} more year${yearsToWait > 1 ? 's' : ''}.`;
    }
    
    return '';
  };

  const getMaxBaptismDate = () => {
    return format(subYears(new Date(), 2), 'yyyy-MM-dd');
  };

  return (
    <div className='space-y-4'>
      <div className='text-center mb-4'>
        <h2 className='text-xl font-semibold text-gray-800'>Spiritual Journey</h2>
        <p className='text-sm text-gray-600'>Tell us about your spiritual walk</p>
      </div>

      <Input
        defaultValue={getValues('baptismDate')}
        label='Baptism Date'
        max={getMaxBaptismDate()}
        type='date'
        variant='bordered'
        {...register('baptismDate')}
        isInvalid={!!errors.baptismDate}
        errorMessage={errors.baptismDate?.message as string || getBaptismValidationMessage()}
      />

      <Select
        defaultSelectedKeys={getValues('baptismStatus') ? [getValues('baptismStatus')] : []}
        label='Baptism Status'
        placeholder='Select your baptism status'
        variant='bordered'
        {...register('baptismStatus')}
        isInvalid={!!errors.baptismStatus}
        errorMessage={errors.baptismStatus?.message as string}
        onChange={(e) => setValue('baptismStatus', e.target.value)}
      >
        {baptismStatusOptions.map((item) => (
          <SelectItem key={item.key} value={item.key}>
            {item.label}
          </SelectItem>
        ))}
      </Select>

      <Select
        defaultSelectedKeys={getValues('meetingAttendance') ? [getValues('meetingAttendance')] : []}
        label='Meeting Attendance'
        placeholder='How often do you attend meetings?'
        variant='bordered'
        {...register('meetingAttendance')}
        isInvalid={!!errors.meetingAttendance}
        errorMessage={errors.meetingAttendance?.message as string}
        onChange={(e) => setValue('meetingAttendance', e.target.value)}
      >
        {meetingOptions.map((item) => (
          <SelectItem key={item.key} value={item.key}>
            {item.label}
          </SelectItem>
        ))}
      </Select>

      <Select
        defaultSelectedKeys={getValues('fieldService') ? [getValues('fieldService')] : []}
        label='Field Service'
        placeholder='How active are you in field service?'
        variant='bordered'
        {...register('fieldService')}
        isInvalid={!!errors.fieldService}
        errorMessage={errors.fieldService?.message as string}
        onChange={(e) => setValue('fieldService', e.target.value)}
      >
        {fieldServiceOptions.map((item) => (
          <SelectItem key={item.key} value={item.key}>
            {item.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        defaultValue={getValues('congregation')}
        label='Congregation Name'
        variant='bordered'
        {...register('congregation')}
        isInvalid={!!errors.congregation}
        errorMessage={errors.congregation?.message as string}
      />

      <div className='flex items-center gap-2'>
        <Checkbox
          defaultSelected={getValues('moralIntegrity') || true}
          {...register('moralIntegrity')}
        >
          I confirm my moral integrity and spiritual standing
        </Checkbox>
      </div>
    </div>
  );
}

