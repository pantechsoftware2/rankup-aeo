import { NextResponse } from 'next/server';
import { getDeepReportJob } from '@/lib/report-jobs';
import { hasReviewRouteAccess } from '@/lib/review-auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!hasReviewRouteAccess(req)) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const job = await getDeepReportJob(params.id);
    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || 'Review payload not found' },
      { status: 404 }
    );
  }
}
