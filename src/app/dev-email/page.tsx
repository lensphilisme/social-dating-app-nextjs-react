import { Button } from '@nextui-org/react';
import Link from 'next/link';

export default function DevEmailPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50'>
      <div className='max-w-2xl w-full bg-white rounded-lg shadow-lg p-8'>
        <h1 className='text-3xl font-bold text-center mb-6 text-gray-800'>
          📧 Email Verification in Development Mode
        </h1>
        
        <div className='space-y-6'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h2 className='text-xl font-semibold text-blue-800 mb-3'>How Email Verification Works</h2>
            <p className='text-blue-700'>
              Since we&apos;re in development mode, email verification links are logged to the console instead of being sent via email.
            </p>
          </div>

          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-yellow-800 mb-2'>Steps to Verify Email:</h3>
            <ol className='list-decimal list-inside space-y-2 text-yellow-700'>
              <li>Register a new account or try to login with an unverified account</li>
              <li>Check your terminal/console for the verification link</li>
              <li>Copy the verification link and paste it in your browser</li>
              <li>Your email will be verified and you can login normally</li>
            </ol>
          </div>

          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-green-800 mb-2'>Admin Access:</h3>
            <p className='text-green-700 mb-3'>
              You can also manually verify users through the admin panel:
            </p>
            <div className='space-y-2'>
              <p className='text-sm text-green-600'>
                <strong>Admin Login:</strong> admin@test.com / password
              </p>
              <p className='text-sm text-green-600'>
                <strong>Admin Panel:</strong> <Link href="/admin/users" className='underline'>/admin/users</Link>
              </p>
            </div>
          </div>

          <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>Example Console Output:</h3>
            <pre className='bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto'>
{`📧 EMAIL VERIFICATION LINK:
Email: user@example.com
Verification Link: http://localhost:3000/verify-email?token=abc123...
Copy this link and open it in your browser to verify your email.`}
            </pre>
          </div>

          <div className='flex justify-center space-x-4 pt-4'>
            <Button as={Link} href='/register' color='primary' size='lg'>
              Register New Account
            </Button>
            <Button as={Link} href='/login' color='secondary' size='lg' variant='bordered'>
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

