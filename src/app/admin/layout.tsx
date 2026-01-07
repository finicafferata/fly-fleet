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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <AdminSidebar session={session} />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
