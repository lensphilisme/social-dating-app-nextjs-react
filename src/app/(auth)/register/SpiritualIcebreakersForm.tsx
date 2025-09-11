'use client';

import { Input, Textarea } from '@nextui-org/react';
import { useFormContext } from 'react-hook-form';

export default function SpiritualIcebreakersForm() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Spiritual Icebreakers</h2>
        <p className="text-sm text-gray-600">Share your spiritual insights and goals</p>
      </div>

      <Input
        defaultValue={getValues('favoriteScripture')}
        label="Favorite Scripture"
        placeholder="e.g., John 3:16, Psalm 23, Proverbs 31:10, etc."
        variant="bordered"
        {...register('favoriteScripture')}
        isInvalid={!!errors.favoriteScripture}
        errorMessage={errors.favoriteScripture?.message as string}
      />

      <Textarea
        defaultValue={getValues('spiritualAchievements')}
        label="Spiritual Achievements"
        placeholder="Share your spiritual milestones, accomplishments, or special privileges you've had..."
        variant="bordered"
        minRows={3}
        maxRows={5}
        {...register('spiritualAchievements')}
        isInvalid={!!errors.spiritualAchievements}
        errorMessage={errors.spiritualAchievements?.message as string}
      />

      <Textarea
        defaultValue={getValues('spiritualGoals')}
        label="Spiritual Goals"
        placeholder="What are your spiritual goals? What do you hope to achieve in your spiritual journey?"
        variant="bordered"
        minRows={3}
        maxRows={5}
        {...register('spiritualGoals')}
        isInvalid={!!errors.spiritualGoals}
        errorMessage={errors.spiritualGoals?.message as string}
      />

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">🎉 Almost Done!</h3>
        <p className="text-sm text-blue-700">
          You're about to complete your registration! Once you submit, your profile will be created with all the information you've provided.
        </p>
      </div>
    </div>
  );
}

