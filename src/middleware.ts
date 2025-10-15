import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/admin/login'
    }
  }
);

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/properties/:path*',
    '/admin/inquiries/:path*',
    '/admin/agents/:path*',
    '/admin/settings/:path*'
  ]
};