import { getSystemAnalytics } from '@/app/actions/adminSystemActions';
import { getAdminSettings } from '@/app/actions/adminSystemActions';
import { getRecentActivity, getSystemStats } from '@/app/actions/adminActivityActions';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [analytics, settings, recentActivity, systemStats] = await Promise.all([
    getSystemAnalytics(30),
    getAdminSettings(),
    getRecentActivity(10),
    getSystemStats()
  ]);

  return (
    <AdminDashboard 
      analytics={analytics} 
      settings={settings}
      recentActivity={recentActivity}
      systemStats={systemStats}
    />
  );
}
