import { getUnverifiedUsers, manuallyVerifyUser } from '@/app/actions/adminActions';
import { Button } from '@nextui-org/react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
  const unverifiedUsers = await getUnverifiedUsers();

  async function verifyUser(userId: string) {
    'use server';
    await manuallyVerifyUser(userId);
    revalidatePath('/admin/users');
  }

  return (
    <div className='flex flex-col mt-10 gap-6'>
      <h3 className='text-2xl'>User Management</h3>
      
      <div className='bg-gray-100 p-4 rounded-lg'>
        <h4 className='text-lg font-semibold mb-4'>Unverified Users ({unverifiedUsers.length})</h4>
        
        {unverifiedUsers.length === 0 ? (
          <p className='text-gray-600'>No unverified users found.</p>
        ) : (
          <div className='space-y-3'>
            {unverifiedUsers.map((user) => (
              <div key={user.id} className='bg-white p-4 rounded border flex justify-between items-center'>
                <div>
                  <p className='font-medium'>{user.name}</p>
                  <p className='text-sm text-gray-600'>{user.email}</p>
                  <p className='text-xs text-gray-500'>
                    Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <form action={verifyUser.bind(null, user.id)}>
                  <Button type='submit' color='success' size='sm'>
                    Verify Email
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-blue-50 p-4 rounded-lg'>
        <h4 className='text-lg font-semibold mb-2'>Development Instructions</h4>
        <p className='text-sm text-gray-700'>
          In development mode, email verification links are logged to the console. 
          Check your terminal for verification links when users register.
        </p>
      </div>
    </div>
  );
}

