import { NextResponse } from 'next/server';
import { processDeepReportJob } from '@/lib/deep-report-processor';
import { hasReviewRouteAccess } from '@/lib/review-auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!hasReviewRouteAccess(req)) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updated = await processDeepReportJob(params.id);

    return NextResponse.json({
      success: true,
      message: 'Report processed and awaiting review.',
      job: {
        id: updated.id,
        status: updated.status,
        compositeScore: updated.report?.compositeScore,
      },
    });
  } catch (error: any) {
    console.error('Deep report process error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to process report' },
      { status: 500 }
    );
  }
}
