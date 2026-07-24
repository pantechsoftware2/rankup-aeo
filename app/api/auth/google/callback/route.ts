import { NextResponse } from 'next/server';
import { findOrCreateGoogleAuditUser, setAuditSessionCookie } from '@/backend/services/auth.service';

const STATE_COOKIE = 'rankup_google_oauth_state';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

function getRedirectUri(req: Request) {
  const configured = process.env.GOOGLE_AUTH_REDIRECT_URI?.trim();
  if (configured) {
    return configured;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(req.url).origin;
  return `${origin.replace(/\/$/, '')}/api/auth/google/callback`;
}

function redirectHome(req: Request, error?: string) {
  const homeUrl = new URL(process.env.NEXT_PUBLIC_APP_URL?.trim() || '/', req.url);
  if (error) {
    homeUrl.searchParams.set('auth_error', error);
  }
  return NextResponse.redirect(homeUrl);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = req.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STATE_COOKIE}=`))
    ?.split('=')[1];

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectHome(req, 'Google login could not be verified. Please try again.');
  }

  const clientId = process.env.GOOGLE_AUTH_CLIENT_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return redirectHome(req, 'Google login is not configured.');
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(req),
        grant_type: 'authorization_code',
      }),
    });

    const tokenResult = await tokenResponse.json().catch(() => null);
    if (!tokenResponse.ok || !tokenResult?.access_token) {
      return redirectHome(req, 'Google login failed before account creation.');
    }

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { authorization: `Bearer ${tokenResult.access_token}` },
    });
    const profile = await profileResponse.json().catch(() => null);

    if (!profileResponse.ok || !profile?.email || profile.email_verified === false) {
      return redirectHome(req, 'Google did not return a verified email address.');
    }

    const user = await findOrCreateGoogleAuditUser({
      fullName: profile.name,
      email: profile.email,
      googleId: profile.sub || profile.email,
    });

    setAuditSessionCookie(user);
    const response = redirectHome(req);
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    return redirectHome(req, 'Google login failed. Please try again.');
  }
}
