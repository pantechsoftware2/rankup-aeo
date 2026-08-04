import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PROTECTED_PREFIXES = ['/dashboard', '/account', '/audit', '/billing', '/settings'];
const AUTH_PAGES = ['/login', '/signup'];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function getSafeNext(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/dashboard';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const { response, user } = await updateSession(req);
  const hasSession = Boolean(user);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage(pathname) && hasSession) {
    return NextResponse.redirect(new URL(getSafeNext(req), req.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|opengraph-image|twitter-image|api/payments/webhook).*)'],
};
