import { getAdminSettings } from '@/app/actions/adminSystemActions';
import AdminSettings from '@/components/admin/AdminSettings';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSettings settings={settings} />
    </div>
  );
}

