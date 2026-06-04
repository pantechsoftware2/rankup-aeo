import path from 'node:path';

const FALLBACK_BOOKING_URL = 'https://cal.com';
const FALLBACK_PROCESSOR_SECRET = 'local-deep-report-secret';

export function getDeepReportConfig() {
  const dataRoot =
    process.env.DEEP_REPORT_DATA_DIR?.trim() ||
    path.join(process.cwd(), '.data', 'deep-report');

  const bookCallUrl =
    process.env.NEXT_PUBLIC_BOOK_DEMO_URL?.trim() ||
    process.env.CAL_COM_PAID_URL?.trim() ||
    FALLBACK_BOOKING_URL;

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    'yourss.naman@gmail.com';

  const senderEmail =
    process.env.FROM_EMAIL?.trim() ||
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    adminEmail;

  const processorSecret =
    process.env.DEEP_REPORT_PROCESSOR_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    FALLBACK_PROCESSOR_SECRET;

  return {
    dataRoot,
    bookCallUrl,
    adminEmail,
    senderEmail,
    processorSecret,
    reviewRequired: process.env.DEEP_REPORT_REVIEW_REQUIRED !== 'false',
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://www.rankupaeo.com',
  };
}

export function getDeepReportJobPath(jobId: string) {
  return path.join(getDeepReportConfig().dataRoot, 'jobs', `${jobId}.json`);
}

export function getDeepReportPdfPath(jobId: string) {
  return path.join(getDeepReportConfig().dataRoot, 'pdfs', `${jobId}.pdf`);
}

export function getDeepReportEvidencePath(jobId: string) {
  return path.join(getDeepReportConfig().dataRoot, 'evidence', `${jobId}.json`);
}

