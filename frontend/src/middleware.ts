import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRolesForPath } from '@/shared/config/route-permissions.config';
import type { Rol } from '@/shared/types/auth.types';

const PUBLIC_ROUTES = ['/login', '/registro', '/simulador'];
const UNAUTHENTICATED_REDIRECT = '/login';
const UNAUTHORIZED_REDIRECT = '/dashboard/unauthorized';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute = pathname.startsWith('/dashboard');
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('sc_token')?.value;
  const role = request.cookies.get('sc_role')?.value as Rol | undefined;

  if (!token || !role) {
    const loginUrl = new URL(UNAUTHENTICATED_REDIRECT, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedRoles = getRolesForPath(pathname);
  const isAllowed = allowedRoles === null || allowedRoles.includes(role);

  if (!isAllowed) {
    return NextResponse.redirect(new URL(UNAUTHORIZED_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};