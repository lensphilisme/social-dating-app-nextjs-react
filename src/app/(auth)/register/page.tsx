import { redirect } from 'next/navigation';

export default function RegisterPage() {
  // Always redirect to referral validation first
  redirect('/register/referral');
}
