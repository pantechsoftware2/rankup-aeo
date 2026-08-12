import { NextResponse, type NextRequest } from 'next/server';
import { upsertUserProfile } from '@/backend/services/auth.service';
import { createSupabaseServerClient } from '@/lib/supabase/create-server-client';

export const dynamic = 'force-dynamic';

function getSafeNext(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/dashboard';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export async function GET(req: NextRequest) {
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
    let response = NextResponse.redirect(new URL(getSafeNext(req), req.url));
    const supabase = createSupabaseServerClient({
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    });

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      throw new Error(exchangeError.message);
    }

    if (data.user) {
      await upsertUserProfile(data.user);
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to finish Google login.';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(`Google login failed: ${message}`)}`, req.url)
    );
  }
}
