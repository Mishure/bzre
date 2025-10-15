import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar user={session.user || {}} />
      
      {/* Main content with proper spacing for sidebar */}
      <div className="flex-1 lg:ml-64 overflow-hidden">
        <main className="h-screen overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}