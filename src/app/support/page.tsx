import { getUserSupportChats } from '@/app/actions/adminReportActions';
import { getAuthUserId } from '@/app/actions/authActions';
import { redirect } from 'next/navigation';
import UserSupportCenter from '@/components/UserSupportCenter';

export default async function SupportPage() {
  const userId = await getAuthUserId();
  
  if (!userId) {
    redirect('/auth/signin');
  }

  const chats = await getUserSupportChats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="mt-2 text-gray-600">
            Get help from our support team or check the status of your reports
          </p>
        </div>

        <UserSupportCenter chats={chats} />
      </div>
    </div>
  );
}

