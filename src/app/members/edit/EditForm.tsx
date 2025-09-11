'use client';

import { updateMemberProfile } from '@/app/actions/userActions';
import { MemberEditSchema } from '@/lib/schemas/memberEditSchema';
import { handleFormServerErrors } from '@/lib/util';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectItem, 
  Checkbox,
  Card,
  CardBody,
  Divider,
  Chip
} from '@nextui-org/react';
import { Member, Gender, BaptismStatus, MeetingAttendance, FieldService, MaritalGoals, ChildrenPreference } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type Props = {
  member: Member;
};

export default function EditForm({ member }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { isValid, isDirty, isSubmitting, errors },
  } = useForm<MemberEditSchema>({
    mode: 'onTouched',
  });

  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        description: member.description,
        city: member.city,
        country: member.country,
        state: member.state || '',
        countryOfBirth: member.countryOfBirth || '',
        baptismDate: member.baptismDate ? member.baptismDate.toISOString().split('T')[0] : '',
        gender: member.gender || 'MALE',
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.toISOString().split('T')[0] : '',
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        congregation: member.congregation || '',
        baptismStatus: member.baptismStatus || 'BAPTIZED',
        meetingAttendance: member.meetingAttendance || 'REGULAR',
        fieldService: member.fieldService || 'ACTIVE',
        spiritualStatement: member.spiritualStatement || '',
        moralIntegrity: member.moralIntegrity || false,
        maritalGoals: member.maritalGoals || 'MARRIAGE_ONLY',
        spiritualExpectations: member.spiritualExpectations || '',
        childrenPreference: member.childrenPreference || 'WANT_CHILDREN',
        hobbies: member.hobbies || '',
        education: member.education || '',
        profession: member.profession || '',
        languages: member.languages || '',
        favoriteScripture: member.favoriteScripture || '',
        spiritualAchievements: member.spiritualAchievements || '',
        spiritualGoals: member.spiritualGoals || '',
      });
    }
  }, [member, reset]);

  const onSubmit = async (data: MemberEditSchema) => {
    const nameUpdated = data.name !== member.name;
    const result = await updateMemberProfile(data, nameUpdated);

    if (result.status === 'success') {
      toast.success('Profile updated successfully! 🙏');
      router.refresh();
      reset({ ...data });
    } else {
      handleFormServerErrors(result, setError);
    }
  };

  const baptismOptions = [
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

  const maritalGoalsOptions = [
    { key: 'MARRIAGE_ONLY', label: 'Marriage-focused only' },
    { key: 'SPIRITUAL_GROWTH', label: 'Spiritual growth together' },
    { key: 'FAMILY_FOCUSED', label: 'Family-focused partnership' }
  ];

  const childrenOptions = [
    { key: 'WANT_CHILDREN', label: 'Want children' },
    { key: 'MAYBE', label: 'Maybe' },
    { key: 'PREFER_NONE', label: 'Prefer none' }
  ];

  return (
    <div className="min-h-screen love-gradient-bg">
      {/* Header Section */}
      <div className="bg-white/10 backdrop-blur-md text-white py-12 px-6 border-b border-white/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="love-title text-white mb-3">My Profile</h1>
              <p className="love-subtitle text-white/90">Complete your spiritual journey profile</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 shadow-2xl">
                <span className="text-5xl">🙏</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Header Card */}
        <Card className="love-card overflow-hidden">
          <CardBody className="p-0">
            <div className="love-gradient-bg h-40 relative">
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="bg-white rounded-full p-3 shadow-2xl">
                  <div className="w-28 h-28 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-5xl text-white">👤</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 mb-2">
                    {member.name || 'Your Name'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <span className="font-semibold">
                        {member.gender === 'MALE' ? 'Male' : member.gender === 'FEMALE' ? 'Female' : 'Not specified'}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🎂</span>
                      <span className="font-semibold">
                        {member.dateOfBirth ? 
                          `${new Date().getFullYear() - member.dateOfBirth.getFullYear()} years old` : 
                          'Age not specified'
                        }
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      <span className="font-semibold">
                        {member.city && member.country ? `${member.city}, ${member.country}` : 'Location not specified'}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Chip className="bg-purple-100 text-purple-700 font-semibold px-4 py-2 rounded-full">
                    {member.baptismStatus === 'BAPTIZED' ? 'Baptized' : 
                     member.baptismStatus === 'INACTIVE' ? 'Inactive' : 
                     member.baptismStatus === 'NEEDS_ENCOURAGEMENT' ? 'Needs Encouragement' : 'Not specified'}
                  </Chip>
                  <Chip className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-full">
                    {member.congregation || 'No congregation'}
                  </Chip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Basic Information */}
        <Card className="love-card">
          <CardBody className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h2 className="text-3xl font-black text-gray-800">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-base font-bold text-gray-700">First Name</label>
                <Input
                  variant="bordered"
                  {...register('firstName')}
                  defaultValue={member.firstName || ''}
                  placeholder="Enter your first name"
                  className="love-input font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Last Name</label>
                <Input
                  variant="bordered"
                  {...register('lastName')}
                  defaultValue={member.lastName || ''}
                  placeholder="Enter your last name"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Display Name</label>
                <Input
                  variant="bordered"
                  {...register('name')}
                  defaultValue={member.name}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  placeholder="How others will see your name"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Gender</label>
                <Select
                  variant="bordered"
                  defaultSelectedKeys={[member.gender || 'MALE']}
                  onSelectionChange={(keys) => setValue('gender', Array.from(keys)[0] as 'MALE' | 'FEMALE')}
                  className="font-medium"
                >
                  <SelectItem key="MALE" value="MALE">Male</SelectItem>
                  <SelectItem key="FEMALE" value="FEMALE">Female</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
                <Input
                  type="date"
                  variant="bordered"
                  {...register('dateOfBirth')}
                  defaultValue={member.dateOfBirth ? member.dateOfBirth.toISOString().split('T')[0] : ''}
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Congregation</label>
                <Input
                  variant="bordered"
                  {...register('congregation')}
                  defaultValue={member.congregation || ''}
                  placeholder="Your congregation name"
                  className="font-medium"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Location Information */}
        <Card className="bg-white shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Location Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current City</label>
                <Input
                  variant="bordered"
                  {...register('city')}
                  defaultValue={member.city}
                  isInvalid={!!errors.city}
                  errorMessage={errors.city?.message}
                  placeholder="Your current city"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">State/Province</label>
                <Input
                  variant="bordered"
                  {...register('state')}
                  defaultValue={member.state || ''}
                  placeholder="Your state or province"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Country</label>
                <Input
                  variant="bordered"
                  {...register('country')}
                  defaultValue={member.country}
                  isInvalid={!!errors.country}
                  errorMessage={errors.country?.message}
                  placeholder="Country where you currently live"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Country of Birth</label>
                <Input
                  variant="bordered"
                  {...register('countryOfBirth')}
                  defaultValue={member.countryOfBirth || ''}
                  placeholder="Country where you were born"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Baptism Date</label>
                <Input
                  type="date"
                  variant="bordered"
                  {...register('baptismDate')}
                  defaultValue={member.baptismDate ? member.baptismDate.toISOString().split('T')[0] : ''}
                  placeholder="When were you baptized?"
                  className="font-medium"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Spiritual Information */}
        <Card className="bg-white shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⛪</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Spiritual Journey</h2>
            </div>
            
            {/* Spiritual Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💧</span>
                  <span className="font-semibold text-blue-800">Baptism Status</span>
                </div>
                <p className="text-sm text-blue-600">
                  {member.baptismStatus === 'BAPTIZED' ? 'Baptized Jehovah\'s Witness' : 
                   member.baptismStatus === 'INACTIVE' ? 'Currently Inactive' : 
                   member.baptismStatus === 'NEEDS_ENCOURAGEMENT' ? 'Needs Spiritual Encouragement' : 'Not specified'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📖</span>
                  <span className="font-semibold text-green-800">Meeting Attendance</span>
                </div>
                <p className="text-sm text-green-600">
                  {member.meetingAttendance === 'REGULAR' ? 'Regular Attendance' : 
                   member.meetingAttendance === 'OCCASIONAL' ? 'Occasional Attendance' : 
                   member.meetingAttendance === 'RARELY' ? 'Rarely Attends' : 'Not specified'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🚪</span>
                  <span className="font-semibold text-purple-800">Field Service</span>
                </div>
                <p className="text-sm text-purple-600">
                  {member.fieldService === 'ACTIVE' ? 'Active in Ministry' : 
                   member.fieldService === 'OCCASIONAL' ? 'Occasional Service' : 
                   member.fieldService === 'INACTIVE' ? 'Currently Inactive' : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Baptism Status</label>
                <Select
                  variant="bordered"
                  defaultSelectedKeys={[member.baptismStatus || 'BAPTIZED']}
                  onSelectionChange={(keys) => setValue('baptismStatus', Array.from(keys)[0] as BaptismStatus)}
                  className="font-medium"
                >
                  {baptismOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Meeting Attendance</label>
                <Select
                  variant="bordered"
                  defaultSelectedKeys={[member.meetingAttendance || 'REGULAR']}
                  onSelectionChange={(keys) => setValue('meetingAttendance', Array.from(keys)[0] as MeetingAttendance)}
                  className="font-medium"
                >
                  {meetingOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Field Service Participation</label>
                <Select
                  variant="bordered"
                  defaultSelectedKeys={[member.fieldService || 'ACTIVE']}
                  onSelectionChange={(keys) => setValue('fieldService', Array.from(keys)[0] as FieldService)}
                  className="font-medium"
                >
                  {fieldServiceOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Moral Standards</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <Checkbox
                    defaultSelected={member.moralIntegrity || false}
                    onValueChange={(checked) => setValue('moralIntegrity', checked)}
                    className="font-medium"
                  >
                    <span className="text-sm text-gray-700">I agree to live according to JW moral standards</span>
                  </Checkbox>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Spiritual Statement</label>
              <Textarea
                variant="bordered"
                {...register('spiritualStatement')}
                defaultValue={member.spiritualStatement || ''}
                placeholder="Share your spiritual goals and why you want a partner in faith (50-200 words)"
                minRows={4}
                className="font-medium"
              />
            </div>
          </CardBody>
        </Card>

        {/* Relationship Preferences */}
        <Card className="bg-white shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💕</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Relationship Goals</h2>
            </div>
            
            {/* Relationship Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💍</span>
                  <span className="font-semibold text-pink-800">Marital Goals</span>
                </div>
                <p className="text-sm text-pink-600">
                  {member.maritalGoals === 'MARRIAGE_ONLY' ? 'Marriage-focused only' : 
                   member.maritalGoals === 'SPIRITUAL_GROWTH' ? 'Spiritual growth together' : 
                   member.maritalGoals === 'FAMILY_FOCUSED' ? 'Family-focused partnership' : 'Not specified'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👶</span>
                  <span className="font-semibold text-blue-800">Children Preference</span>
                </div>
                <p className="text-sm text-blue-600">
                  {member.childrenPreference === 'WANT_CHILDREN' ? 'Want children' : 
                   member.childrenPreference === 'MAYBE' ? 'Maybe' : 
                   member.childrenPreference === 'PREFER_NONE' ? 'Prefer none' : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Marital Goals</label>
                <Select
                  variant="bordered"
                  defaultSelectedKeys={[member.maritalGoals || 'MARRIAGE_ONLY']}
                  onSelectionChange={(keys) => setValue('maritalGoals', Array.from(keys)[0] as MaritalGoals)}
                  className="font-medium"
                >
                  {maritalGoalsOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Children Preference</label>
                <Select
                  variant="bordered"
                  defaultSelectedKeys={[member.childrenPreference || 'WANT_CHILDREN']}
                  onSelectionChange={(keys) => setValue('childrenPreference', Array.from(keys)[0] as ChildrenPreference)}
                  className="font-medium"
                >
                  {childrenOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Spiritual Expectations for Partner</label>
              <Textarea
                variant="bordered"
                {...register('spiritualExpectations')}
                defaultValue={member.spiritualExpectations || ''}
                placeholder="Describe your spiritual expectations for your future partner..."
                minRows={3}
                className="font-medium"
              />
            </div>
          </CardBody>
        </Card>

        {/* Lifestyle Information */}
        <Card className="bg-white shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🌟</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Lifestyle & Interests</h2>
            </div>
            
            {/* Lifestyle Status Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎓</span>
                  <span className="font-semibold text-green-800">Education</span>
                </div>
                <p className="text-sm text-green-600">
                  {member.education || 'Not specified'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💼</span>
                  <span className="font-semibold text-blue-800">Profession</span>
                </div>
                <p className="text-sm text-blue-600">
                  {member.profession || 'Not specified'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🗣️</span>
                  <span className="font-semibold text-purple-800">Languages</span>
                </div>
                <p className="text-sm text-purple-600">
                  {member.languages || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Education</label>
                <Input
                  variant="bordered"
                  {...register('education')}
                  defaultValue={member.education || ''}
                  placeholder="Your educational background"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Profession</label>
                <Input
                  variant="bordered"
                  {...register('profession')}
                  defaultValue={member.profession || ''}
                  placeholder="Your profession"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Languages Spoken</label>
                <Input
                  variant="bordered"
                  {...register('languages')}
                  defaultValue={member.languages || ''}
                  placeholder="e.g., English, Spanish, French"
                  className="font-medium"
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-gray-700">Hobbies & Interests</label>
              <Textarea
                variant="bordered"
                {...register('hobbies')}
                defaultValue={member.hobbies || ''}
                placeholder="Share your hobbies and interests..."
                minRows={3}
                className="font-medium"
              />
            </div>
          </CardBody>
        </Card>

        {/* Spiritual Icebreakers */}
        <Card className="bg-white shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📖</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Spiritual Icebreakers</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Favorite Scripture</label>
                <Input
                  variant="bordered"
                  {...register('favoriteScripture')}
                  defaultValue={member.favoriteScripture || ''}
                  placeholder="e.g., John 3:16, Proverbs 31:10"
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Spiritual Achievements</label>
                <Textarea
                  variant="bordered"
                  {...register('spiritualAchievements')}
                  defaultValue={member.spiritualAchievements || ''}
                  placeholder="Pioneer experience, ministry milestones, etc."
                  minRows={2}
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Goals for Spiritual Growth in Marriage</label>
                <Textarea
                  variant="bordered"
                  {...register('spiritualGoals')}
                  defaultValue={member.spiritualGoals || ''}
                  placeholder="Share your spiritual goals for marriage..."
                  minRows={3}
                  className="font-medium"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* About Me */}
        <Card className="bg-white shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                About {member.gender === 'FEMALE' ? 'Her' : 'Him'}
              </h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Personal Description - About {member.gender === 'FEMALE' ? 'Her' : 'Him'}
              </label>
              <Textarea
                variant="bordered"
                {...register('description')}
                defaultValue={member.description}
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message}
                placeholder={`Tell us about ${member.gender === 'FEMALE' ? 'her' : 'him'}self, ${member.gender === 'FEMALE' ? 'her' : 'his'} personality, and what makes ${member.gender === 'FEMALE' ? 'her' : 'him'} unique...`}
                minRows={6}
                className="font-medium"
              />
            </div>
          </CardBody>
        </Card>

        {errors.root?.serverError && (
          <Card className="bg-red-50 border-red-200 shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className='text-red-600 text-sm font-medium'>{errors.root.serverError.message}</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-center pt-8 pb-12">
          <Button
            type='submit'
            size="lg"
            variant='solid'
            isDisabled={!isValid || !isDirty}
            isLoading={isSubmitting}
            className="love-button-primary px-20 py-6 text-2xl font-black"
          >
            {isSubmitting ? 'Saving Profile...' : 'Save Profile 🙏'}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}
