import SessionProvider from '@/components/admin/SessionProvider'
import ToasterProvider from '@/components/admin/ToasterProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToasterProvider />
      {children}
    </SessionProvider>
  );
}