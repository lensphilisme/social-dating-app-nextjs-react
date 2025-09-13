import { redirect } from 'next/navigation';
import { getUserRole } from '@/app/actions/authActions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();
  
  if (role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
