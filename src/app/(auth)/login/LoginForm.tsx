'use client';

import { signInUser } from '@/app/actions/authActions';
import { LoginSchema, loginSchema } from '@/lib/schemas/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { GiPadlock } from 'react-icons/gi';
import { toast } from 'react-toastify';
import SocialLogin from './SocialLogin';

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = await signInUser(data);
    if (result.status === 'success') {
      router.push('/members');
      router.refresh();
    } else {
      toast.error(result.error as string);
    }
  };

  return (
    <Card className='love-card'>
      <CardHeader className='flex flex-col items-center justify-center pb-8'>
        <div className='flex flex-col gap-4 items-center text-center'>
          <div className='flex flex-row items-center gap-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg'>
              <GiPadlock size={32} className='text-white' />
            </div>
            <h1 className='love-title text-gray-800'>Login</h1>
          </div>
          <p className='love-subtitle text-gray-600'>Welcome back to JW Faith Dating</p>
        </div>
      </CardHeader>
      <CardBody className='px-8 pb-8'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-base font-bold text-gray-700'>Email</label>
              <Input
                defaultValue=''
                variant='bordered'
                {...register('email')}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message as string}
                className='love-input'
                placeholder='Enter your email'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-base font-bold text-gray-700'>Password</label>
              <Input
                defaultValue=''
                variant='bordered'
                type='password'
                {...register('password')}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message as string}
                className='love-input'
                placeholder='Enter your password'
              />
            </div>
            <Button
              isLoading={isSubmitting}
              isDisabled={!isValid}
              fullWidth
              type='submit'
              className='love-button-primary py-4 text-lg font-bold'
            >
              Login
            </Button>
            <SocialLogin />
            <div className='flex flex-col items-center space-y-3'>
              <Link href='/forgot-password' className='text-purple-600 hover:text-purple-700 font-semibold text-sm hover:underline'>
                Forgot password?
              </Link>
              <div className='text-center'>
                <span className='text-gray-600 text-sm'>Don't have an account? </span>
                <Link href='/register' className='text-purple-600 hover:text-purple-700 font-semibold text-sm hover:underline'>
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
