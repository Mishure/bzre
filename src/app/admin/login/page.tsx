import ToasterProvider from '@/components/admin/ToasterProvider';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToasterProvider />
      <AdminLoginForm />
    </div>
  );
}