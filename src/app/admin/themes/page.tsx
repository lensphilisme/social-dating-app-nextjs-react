import { getThemes } from '@/app/actions/adminSystemActions';
import ThemeManagement from '@/components/admin/ThemeManagement';

export const dynamic = 'force-dynamic';

export default async function ThemeManagementPage() {
  const themes = await getThemes();

  return (
    <ThemeManagement themes={themes} />
  );
}

