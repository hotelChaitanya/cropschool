import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env['JWT_SECRET'] || 'your-secret-key'
);

// Define protected routes
const protectedRoutes = ['/dashboard', '/settings', '/profile'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
  ];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload['userId'] as string);
    requestHeaders.set('x-user-role', payload['role'] as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
