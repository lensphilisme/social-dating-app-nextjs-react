'use client';

import { Card, CardBody, CardHeader, Input, Button } from '@nextui-org/react';
import { useState } from 'react';

interface ReferralSectionProps {
  referralCode?: string | null;
  referredByUser?: {
    member?: { name?: string | null } | null;
    name?: string | null;
  } | null;
  referredUsers?: Array<{
    id: string;
    member?: { name?: string | null } | null;
    name?: string | null;
  }>;
}

export default function ReferralSection({ 
  referralCode, 
  referredByUser, 
  referredUsers = [] 
}: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy referral code:', error);
      }
    }
  };

  return (
    <Card className="love-card mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🔗</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800">Referral Information</h2>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Your Referral Code</label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={referralCode || 'Generating...'}
                readOnly
                className="font-mono text-lg"
                endContent={
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onClick={handleCopyCode}
                    disabled={!referralCode}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                }
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this code with single, baptized Jehovah&apos;s Witnesses who meet our criteria
            </p>
          </div>
          
          {referredByUser && (
            <div>
              <label className="text-sm font-semibold text-gray-600">Referred By</label>
              <p className="text-lg font-medium text-gray-800">
                {referredByUser.member?.name || referredByUser.name || 'Unknown'}
              </p>
            </div>
          )}
          
          {referredUsers.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-600">People You&apos;ve Referred</label>
              <div className="space-y-2 mt-2">
                {referredUsers.map((referredUser) => (
                  <div key={referredUser.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    <span className="text-gray-800">
                      {referredUser.member?.name || referredUser.name || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

