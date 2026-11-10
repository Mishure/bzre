import type { Metadata } from 'next'
import SessionProvider from '@/components/admin/SessionProvider'
import ToasterProvider from '@/components/admin/ToasterProvider'

// Admin area must never be indexed.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

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