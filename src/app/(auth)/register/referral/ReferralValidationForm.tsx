'use client';

import { validateReferralCodeAction } from '@/app/actions/referralActions';
import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GiPadlock } from 'react-icons/gi';

export default function ReferralValidationForm() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [referrerName, setReferrerName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const result = await validateReferralCodeAction(referralCode.trim());
      
      if (result.status === 'success' && result.data?.valid) {
        setReferrerName(result.data.referrerName || 'Unknown');
        // Store the referral code in sessionStorage for the next step
        sessionStorage.setItem('validReferralCode', referralCode.trim());
        // Redirect to the main registration form
        router.push('/register/form');
      } else {
        setError(result.error || 'Invalid referral code');
      }
    } catch (error) {
      setError('Error validating referral code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-center justify-center pb-4">
        <div className="flex flex-col gap-2 items-center text-secondary">
          <div className="flex flex-row items-center gap-3">
            <GiPadlock size={30} />
            <h1 className="text-3xl font-semibold">Access Required</h1>
          </div>
          <p className="text-neutral-500 text-center">
            Enter your referral code to access NextMatch
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Referral Code"
              placeholder="Enter your referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              variant="bordered"
              isInvalid={!!error}
              errorMessage={error}
              className="w-full"
            />
          </div>

          {referrerName && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ Valid referral code! Referred by: <strong>{referrerName}</strong>
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔒 Platform Access</h3>
            <p className="text-sm text-blue-700">
              This platform is exclusively for baptized Jehovah's Witnesses who meet our criteria:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Must be baptized for at least 2 years</li>
              <li>• Males: 25+ years old</li>
              <li>• Females: 23+ years old</li>
              <li>• Valid referral code required</li>
            </ul>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
            isLoading={isValidating}
            isDisabled={!referralCode.trim()}
          >
            {isValidating ? 'Validating...' : 'Continue to Registration'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
