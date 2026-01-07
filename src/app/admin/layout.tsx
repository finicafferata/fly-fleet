import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin Dashboard | Fly-Fleet',
  description: 'Fly-Fleet Admin Dashboard',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // Redirect to login if not authenticated
  if (!session || session.user?.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar session={session} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
