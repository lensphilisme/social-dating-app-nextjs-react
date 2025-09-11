'use client';

import { Select, SelectItem, Textarea } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

export default function GoalsForm() {
  const {
    register,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const spiritualExpectations = watch('spiritualExpectations');

  const maritalGoalsOptions = [
    { key: 'MARRIAGE_ONLY', label: 'Marriage-focused only' },
    { key: 'SPIRITUAL_GROWTH', label: 'Spiritual growth together' },
    { key: 'FAMILY_FOCUSED', label: 'Family-focused partnership' }
  ];

  const childrenPreferenceOptions = [
    { key: 'WANT_CHILDREN', label: 'Want children' },
    { key: 'NO_CHILDREN', label: 'Do not want children' },
    { key: 'OPEN_TO_DISCUSSION', label: 'Open to discussion' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Relationship Goals</h2>
        <p className="text-sm text-gray-600">What are you looking for in a relationship?</p>
      </div>

      <Select
        label="Marital Goals"
        placeholder="Select your marital goals"
        variant="bordered"
        selectedKeys={getValues('maritalGoals') ? [getValues('maritalGoals')] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          setValue('maritalGoals', selectedKey);
        }}
        isInvalid={!!errors.maritalGoals}
        errorMessage={errors.maritalGoals?.message as string}
      >
        {maritalGoalsOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Children Preference"
        placeholder="Select your preference regarding children"
        variant="bordered"
        selectedKeys={getValues('childrenPreference') ? [getValues('childrenPreference')] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          setValue('childrenPreference', selectedKey);
        }}
        isInvalid={!!errors.childrenPreference}
        errorMessage={errors.childrenPreference?.message as string}
      >
        {childrenPreferenceOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      <Textarea
        defaultValue={getValues('spiritualExpectations')}
        label="Spiritual Expectations"
        placeholder="What spiritual qualities are you looking for in a partner? What are your expectations for spiritual growth together?"
        variant="bordered"
        minRows={3}
        maxRows={5}
        {...register('spiritualExpectations')}
        isInvalid={!!errors.spiritualExpectations}
        errorMessage={errors.spiritualExpectations?.message as string}
      />

      <div className="text-sm text-gray-500">
        {spiritualExpectations ? `${spiritualExpectations.length}/300 characters` : '0/300 characters'}
      </div>
    </div>
  );
}

