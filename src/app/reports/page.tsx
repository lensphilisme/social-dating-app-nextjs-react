import { getAuthUserId } from '@/app/actions/authActions';
import { redirect } from 'next/navigation';
import UserReportManagement from '@/components/UserReportManagement';
import { getUserReports } from '@/app/actions/userReportActions';

export default async function UserReportsPage() {
  const userId = await getAuthUserId();
  
  if (!userId) {
    redirect('/auth/signin');
  }

  const reportData = await getUserReports();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="mt-2 text-gray-600">
            View and manage your reports and support requests
          </p>
        </div>

        <UserReportManagement 
          sentReports={reportData.sent || []} 
          receivedReports={reportData.received || []} 
        />
      </div>
    </div>
  );
}
