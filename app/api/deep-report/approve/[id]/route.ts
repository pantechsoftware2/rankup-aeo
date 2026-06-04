import { NextResponse } from 'next/server';
import { getDeepReportJob, updateDeepReportJob } from '@/lib/report-jobs';
import { renderConsultingReportPdf } from '@/lib/report-pdf';
import { sendDeepReportReadyEmail } from '@/lib/report-delivery';
import { hasReviewRouteAccess } from '@/lib/review-auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!hasReviewRouteAccess(req)) {
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const job = await getDeepReportJob(params.id);

    if (!job.report) {
      return NextResponse.json(
        { error: true, message: 'Report must be processed before approval.' },
        { status: 400 }
      );
    }

    const pdf = await renderConsultingReportPdf(job.report);
    await sendDeepReportReadyEmail(job, job.report, pdf);

    const updated = await updateDeepReportJob(params.id, (current) => ({
      ...current,
      status: 'sent',
      approvedAt: current.approvedAt || new Date().toISOString(),
      sentAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: 'Report approved and delivered.',
      job: {
        id: updated.id,
        status: updated.status,
        sentAt: updated.sentAt,
      },
    });
  } catch (error: any) {
    console.error('Approve deep report error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to approve report' },
      { status: 500 }
    );
  }
}
