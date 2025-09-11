import { getMemberByUserId } from '@/app/actions/memberActions';
import { notFound } from 'next/navigation';
import ProfileDetailContent from '@/components/profile/ProfileDetailContent';

export default async function MemberDetailedPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const member = await getMemberByUserId(userId);

  if (!member) return notFound();

  return <ProfileDetailContent member={member} />;
}


