import { getAllUsers } from '@/app/actions/adminSystemActions';
import UserManagement from '@/components/admin/UserManagement';

export const dynamic = 'force-dynamic';

interface UserManagementPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function UserManagementPage({ searchParams }: UserManagementPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  
  const usersData = await getAllUsers(page, 20, search);

  return (
    <UserManagement 
      usersData={usersData}
      currentPage={page}
      searchQuery={search}
    />
  );
}