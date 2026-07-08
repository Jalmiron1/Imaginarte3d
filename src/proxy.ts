import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Omitir login de administración y la API de login
  if (path === '/admin/login' || path === '/api/admin/login') {
    return NextResponse.next();
  }

  const session = request.cookies.get('admin_session')?.value;
  const isAuthenticated = session === 'authenticated';

  if (!isAuthenticated) {
    // Si es una petición API, retornar JSON con error
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    // Si es una vista HTML, redirigir a login
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
