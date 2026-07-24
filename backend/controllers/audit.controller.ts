import { NextResponse } from 'next/server';
import { getAuditByStripeSession } from '@/backend/services/audit-history.service';

export async function getAuditBySession(sessionId: string) {
  try {
    const audit = await getAuditByStripeSession(sessionId);
    return NextResponse.json({ ready: Boolean(audit), audit });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load audit.' },
      { status: 500 }
    );
  }
}
