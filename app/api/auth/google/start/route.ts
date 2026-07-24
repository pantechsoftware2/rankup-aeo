import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

const STATE_COOKIE = 'rankup_google_oauth_state';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

function getRedirectUri(req: Request) {
  const configured = process.env.GOOGLE_AUTH_REDIRECT_URI?.trim();
  if (configured) {
    return configured;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin;
  return `${origin.replace(/\/$/, '')}/api/auth/google/callback`;
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_AUTH_CLIENT_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: 'Google login is not configured. Set GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET.' },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(24).toString('hex');
  const authorizeUrl = new URL(GOOGLE_AUTH_URL);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', getRedirectUri(req));
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'openid email profile');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  });

  return response;
}
