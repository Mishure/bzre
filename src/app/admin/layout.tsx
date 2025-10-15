export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For the login page, render without layout
  // The actual auth check happens in individual pages
  return <>{children}</>;
}