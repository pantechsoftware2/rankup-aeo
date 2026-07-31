import { NextResponse } from 'next/server';
import {
  clearAuthCookies,
  getCurrentAuditUser,
  signInWithEmail,
  signUpWithEmail,
} from '@/backend/services/auth.service';

export async function getMe() {
  const user = await getCurrentAuditUser();
  return NextResponse.json({ authenticated: Boolean(user), user });
}

export async function signUp(req: Request) {
  try {
    const body = await req.json();
    const result = await signUpWithEmail({
      fullName: body?.fullName || '',
      email: body?.email || '',
      password: body?.password || '',
    });
    return NextResponse.json({
      success: true,
      user: result.user,
      authenticated: Boolean(result.session),
      requiresVerification: result.requiresVerification,
      message: result.requiresVerification ? 'Check your email to verify your account before logging in.' : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to create account.' },
      { status: 400 }
    );
  }
}

export async function logIn(req: Request) {
  try {
    const body = await req.json();
    const user = await signInWithEmail({
      email: body?.email || '',
      password: body?.password || '',
    });
    return NextResponse.json({ success: true, authenticated: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to log in.' },
      { status: 401 }
    );
  }
}

export async function logOut() {
  await clearAuthCookies();
  return NextResponse.json({ success: true });
}
