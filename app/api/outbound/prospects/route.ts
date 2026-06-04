import { NextResponse } from 'next/server';
import { listOutboundProspects } from '@/lib/outbound-storage';
import { hasReviewRouteAccess } from '@/lib/review-auth';
import type { OutboundSegment } from '@/types/outbound';

export async function GET(req: Request) {
  if (!hasReviewRouteAccess(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const segment = url.searchParams.get('segment') as OutboundSegment | null;
    const status = url.searchParams.get('status') as
      | 'new'
      | 'snapshot_ready'
      | 'rejected'
      | null;
    const limit = Number(url.searchParams.get('limit') || '50');
    const prospects = await listOutboundProspects({
      segment: segment || undefined,
      status: status || undefined,
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(100, limit)) : 50,
    });

    return NextResponse.json({
      success: true,
      count: prospects.length,
      prospects,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error?.message || 'Failed to load outbound prospects',
      },
      { status: 400 }
    );
  }
}
