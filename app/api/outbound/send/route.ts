import { NextResponse } from 'next/server';
import { findOutboundProspectById } from '@/lib/outbound-storage';
import { sendOutboundSnapshotEmail } from '@/lib/outbound-email';
import { writeLeadLog } from '@/lib/lead-log';
import { hasReviewRouteAccess } from '@/lib/review-auth';

export async function POST(req: Request) {
  try {
    if (!hasReviewRouteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const prospectId = body?.prospectId?.trim();

    if (!prospectId) {
      return NextResponse.json({ error: 'prospectId is required' }, { status: 400 });
    }

    const prospect = await findOutboundProspectById(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const result = await sendOutboundSnapshotEmail({
      prospect,
      toEmail: body?.toEmail,
      recipientName: body?.recipientName,
    });

    await writeLeadLog('outbound-email-sent', {
      prospectId: prospect.id,
      segment: prospect.segment,
      website: prospect.website,
      companyName: prospect.companyName,
      toEmail: result.toEmail,
      sourceQuery: prospect.sourceQuery,
      opportunityScore: prospect.opportunityScore,
    });

    return NextResponse.json({
      success: true,
      prospectId: prospect.id,
      toEmail: result.toEmail,
    });
  } catch (error: any) {
    console.error('[Outbound] Send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send outbound snapshot' },
      { status: 500 }
    );
  }
}
