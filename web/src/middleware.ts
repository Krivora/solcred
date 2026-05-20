import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/registro'];
const DEFAULT_AUTHENTICATED_REDIRECT = '/dashboard';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // El token vive en sessionStorage (client-side) — el middleware
  // solo protege rutas a nivel de navegación del servidor.
  // La verificación real del token se hace en el cliente con el store.
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};