import { NextResponse } from 'next/server';
import { getDeepReportJob } from '@/lib/report-jobs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const job = await getDeepReportJob(params.id);
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        website: job.website,
        brandName: job.brandName,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        sentAt: job.sentAt,
        approvedAt: job.approvedAt,
        error: job.error,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message || 'Job not found' },
      { status: 404 }
    );
  }
}
