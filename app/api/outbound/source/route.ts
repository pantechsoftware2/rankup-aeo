import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hasReviewRouteAccess } from '@/lib/review-auth';
import { sourceOutboundProspects } from '@/lib/outbound-source';

const bodySchema = z.object({
  segment: z.enum(['b2b_services', 'home_services', 'law_firms']),
  location: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(20).optional(),
});

export async function POST(req: Request) {
  if (!hasReviewRouteAccess(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const prospects = await sourceOutboundProspects(body);
    return NextResponse.json({
      success: true,
      count: prospects.length,
      prospects,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error?.message || 'Failed to source prospects',
      },
      { status: 400 }
    );
  }
}
