import { NextResponse } from 'next/server';
import { exchangeOAuthCodeForSession } from '@/backend/services/auth.service';

export const dynamic = 'force-dynamic';

function getSafeNext(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/dashboard';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error_description') || url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(`Google login failed: ${error}`)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=Google%20login%20failed%3A%20missing%20authorization%20code.', req.url)
    );
  }

  try {
    await exchangeOAuthCodeForSession(code);
    return NextResponse.redirect(new URL(getSafeNext(req), req.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to finish Google login.';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(`Google login failed: ${message}`)}`, req.url)
    );
  }
}
