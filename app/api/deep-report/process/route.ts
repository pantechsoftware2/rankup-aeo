import { NextResponse } from 'next/server';
import { processNextDeepReportJob } from '@/lib/deep-report-processor';
import { hasReviewRouteAccess } from '@/lib/review-auth';

export async function POST(req: Request) {
  if (!hasReviewRouteAccess(req)) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const job = await processNextDeepReportJob();

    if (!job) {
      return NextResponse.json({
        success: true,
        message: 'No queued reports found.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Queued report processed and is awaiting review.',
      job: {
        id: job.id,
        status: job.status,
        website: job.website,
        compositeScore: job.report?.compositeScore,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to process next queued report' },
      { status: 500 }
    );
  }
}
