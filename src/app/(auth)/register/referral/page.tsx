import ReferralValidationForm from './ReferralValidationForm';

export default function ReferralPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="max-w-md w-full mx-4">
        <ReferralValidationForm />
      </div>
    </div>
  );
}

