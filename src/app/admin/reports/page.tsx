import { getAllReportsWithDetails, getReportStatistics } from '@/app/actions/adminReportActions';
import AdminReportManagement from '@/components/admin/AdminReportManagement';

export default async function AdminReportsPage() {
  const [reports, statistics] = await Promise.all([
    getAllReportsWithDetails(),
    getReportStatistics()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage user reports with support center integration
          </p>
        </div>

        <AdminReportManagement 
          reports={reports} 
          statistics={statistics}
        />
      </div>
    </div>
  );
}

