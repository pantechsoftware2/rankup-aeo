import 'server-only';

import type { User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import type { PublicAuditUser } from '@/backend/models/user';

const PROFILE_TABLE = 'users';
const LEGACY_USERS_TABLE = 'audit_users';

function toPublicUser(user: User, fullName?: string | null): PublicAuditUser {
  return {
    id: user.id,
    email: user.email || '',
    fullName:
      fullName ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      'RankUp user',
  };
}

function getSafeNext(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/dashboard';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

async function getProfileFullName(userId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from(PROFILE_TABLE).select('full_name').eq('id', userId).maybeSingle();
  return data?.full_name || null;
}

export async function upsertUserProfile(user: User, fullName?: string | null) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !user.email) {
    return;
  }

  const name =
    fullName?.trim() ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email;
  const now = new Date().toISOString();

  const { error } = await supabase.from(PROFILE_TABLE).upsert(
    {
      id: user.id,
      full_name: name,
      email: user.email.toLowerCase(),
      auth_provider: user.app_metadata?.provider || 'email',
      updated_at: now,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`);
  }

  await supabase.from(LEGACY_USERS_TABLE).upsert(
    {
      id: user.id,
      full_name: name,
      email: user.email.toLowerCase(),
      password_hash: 'supabase-auth',
      created_at: user.created_at || now,
    },
    { onConflict: 'id' }
  );
}

export async function signUpWithEmail(input: { fullName: string; email: string; password: string }) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName) {
    throw new Error('Full name is required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: existingProfile, error: existingProfileError } = await admin
      .from(PROFILE_TABLE)
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfileError) {
      throw new Error(existingProfileError.message);
    }

    if (existingProfile) {
      throw new Error('An account already exists for this email.');
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Supabase did not return a user for this signup.');
  }

  await upsertUserProfile(data.user, fullName);

  return {
    user: toPublicUser(data.user, fullName),
    session: data.session,
    requiresVerification: !data.session,
  };
}

export async function signInWithEmail(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  if (!password) {
    throw new Error('Password is required.');
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    throw new Error('Login succeeded but Supabase did not return a session.');
  }

  await upsertUserProfile(data.user);
  return toPublicUser(data.user, await getProfileFullName(data.user.id));
}

export async function getGoogleOAuthUrl(req: Request) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl(req)}/auth/callback?next=${encodeURIComponent(getSafeNext(req))}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.url) {
    throw new Error('Supabase did not return a Google OAuth URL.');
  }

  return data.url;
}

export async function exchangeOAuthCodeForSession(code: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    throw new Error('Supabase did not return a session for this OAuth callback.');
  }

  await upsertUserProfile(data.user);
  return toPublicUser(data.user, await getProfileFullName(data.user.id));
}

export async function getCurrentAuditUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return toPublicUser(data.user, await getProfileFullName(data.user.id));
}

export async function clearAuthCookies() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
