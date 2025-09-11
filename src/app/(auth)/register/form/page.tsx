'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RegisterForm from '../RegisterForm';

export default function RegisterFormPage() {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Check if user has a valid referral code
    if (typeof window !== 'undefined') {
      const validReferralCode = sessionStorage.getItem('validReferralCode');
      
      if (!validReferralCode) {
        // Redirect to referral validation page
        router.push('/register/referral');
        return;
      }
    }
    
    setIsValidating(false);
  }, [router]);

  if (isValidating) {
    return (
      <div className="min-h-screen love-gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Validating access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen love-gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}

