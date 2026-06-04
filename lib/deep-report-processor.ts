import { generateConsultingReportForWebsite } from '@/lib/consulting-report';
import { findNextQueuedJob, getDeepReportJob, updateDeepReportJob } from '@/lib/report-jobs';
import { sendDeepReportReviewReadyAdminEmail } from '@/lib/report-delivery';

function getPaidCallUrl() {
  return (
    process.env.NEXT_PUBLIC_PAID_CALL_URL?.trim() ||
    process.env.NEXT_PUBLIC_PAID_CAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_BOOK_DEMO_URL?.trim() ||
    'https://cal.com'
  );
}

export async function processDeepReportJob(id: string) {
  await getDeepReportJob(id);

  const processing = await updateDeepReportJob(id, (job) => ({
    ...job,
    status: 'processing',
    error: undefined,
  }));

  try {
    const generated = await generateConsultingReportForWebsite(processing.website, getPaidCallUrl());

    const updated = await updateDeepReportJob(id, (job) => ({
      ...job,
      status: 'awaiting_review',
      brandName: generated.report.brandName || generated.evidence.brandName || job.brandName,
      evidence: generated.evidence,
      scorecard: generated.scorecard,
      report: generated.report,
      error: undefined,
    }));

    try {
      await sendDeepReportReviewReadyAdminEmail(updated);
    } catch (emailError) {
      console.error('Review-ready admin email failed:', emailError);
    }

    return updated;
  } catch (error: any) {
    await updateDeepReportJob(id, (job) => ({
      ...job,
      status: 'failed',
      error: error?.message || 'Unknown processing error',
    }));
    throw error;
  }
}

export async function processNextDeepReportJob() {
  const nextJob = await findNextQueuedJob();
  if (!nextJob) {
    return null;
  }

  return processDeepReportJob(nextJob.id);
}
