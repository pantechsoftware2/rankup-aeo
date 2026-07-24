import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, getSessionSecret } from '@/backend/config/auth';
import type { AuditUser, PublicAuditUser } from '@/backend/models/user';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const USERS_TABLE = 'audit_users';
const memoryUsers = new Map<string, AuditUser>();

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) {
    return false;
  }

  const actual = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

function createToken(user: Pick<AuditUser, 'id' | 'email'>) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function parseToken(token?: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== sign(payload)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed?.id || !parsed?.email || Date.now() > parsed.exp) {
      return null;
    }
    return { id: String(parsed.id), email: String(parsed.email) };
  } catch {
    return null;
  }
}

function toPublicUser(user: AuditUser): PublicAuditUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

function fromRow(row: any): AuditUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

async function findUserByEmail(email: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase.from(USERS_TABLE).select('*').eq('email', email).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data ? fromRow(data) : null;
  }

  return memoryUsers.get(email) || null;
}

export async function createAuditUser(input: { fullName: string; email: string; password: string }) {
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

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: existing, error: existingError } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      throw new Error('An account already exists for this email.');
    }

    const user: AuditUser = {
      id: crypto.randomUUID(),
      fullName,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from(USERS_TABLE).insert({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
    });

    if (error) {
      throw new Error(error.message);
    }

    return toPublicUser(user);
  }

  if (memoryUsers.has(email)) {
    throw new Error('An account already exists for this email.');
  }

  const user: AuditUser = {
    id: crypto.randomUUID(),
    fullName,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  memoryUsers.set(email, user);
  return toPublicUser(user);
}

export async function findOrCreateGoogleAuditUser(input: { fullName?: string; email: string; googleId: string }) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName?.trim() || email;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Google did not return a valid email address.');
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return toPublicUser(existing);
  }

  const user: AuditUser = {
    id: crypto.randomUUID(),
    fullName,
    email,
    passwordHash: `google:${input.googleId}`,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from(USERS_TABLE).insert({
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
    });

    if (error) {
      throw new Error(error.message);
    }
  } else {
    memoryUsers.set(email, user);
  }

  return toPublicUser(user);
}

export async function verifyAuditUser(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const user = await findUserByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid email or password.');
  }

  return toPublicUser(user);
}

export function setAuditSessionCookie(user: { id: string; email: string }) {
  cookies().set(SESSION_COOKIE, createToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

export function clearAuditSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentAuditUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = parseToken(token);
  if (!session) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from(USERS_TABLE).select('*').eq('id', session.id).maybeSingle();
    if (error || !data) {
      return null;
    }
    return toPublicUser(fromRow(data));
  }

  const user = Array.from(memoryUsers.values()).find((item) => item.id === session.id);
  return user ? toPublicUser(user) : { id: session.id, email: session.email, fullName: session.email };
}
