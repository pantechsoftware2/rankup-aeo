import { NextResponse } from 'next/server';
import {
  clearAuditSessionCookie,
  createAuditUser,
  getCurrentAuditUser,
  setAuditSessionCookie,
  verifyAuditUser,
} from '@/backend/services/auth.service';

export async function getMe() {
  const user = await getCurrentAuditUser();
  return NextResponse.json({ authenticated: Boolean(user), user });
}

export async function signUp(req: Request) {
  try {
    const body = await req.json();
    const user = await createAuditUser({
      fullName: body?.fullName || '',
      email: body?.email || '',
      password: body?.password || '',
    });
    setAuditSessionCookie(user);
    return NextResponse.json({ success: true, user });
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
    const user = await verifyAuditUser(body?.email || '', body?.password || '');
    setAuditSessionCookie(user);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to log in.' },
      { status: 401 }
    );
  }
}

export function logOut() {
  clearAuditSessionCookie();
  return NextResponse.json({ success: true });
}
