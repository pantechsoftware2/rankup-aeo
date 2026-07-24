import path from 'node:path';

export function getDeepReportConfig() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '') || '';
  const dataRoot =
    process.env.DEEP_REPORT_DATA_DIR?.trim() ||
    path.join(process.cwd(), '.data', 'deep-report');

  const bookCallUrl = appUrl ? `${appUrl}/audit-flow` : '/audit-flow';

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    'yourss.naman@gmail.com';

  const senderEmail =
    process.env.FROM_EMAIL?.trim() ||
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    adminEmail;

  const processorSecret = process.env.DEEP_REPORT_ADMIN_TOKEN?.trim() || '';

  return {
    dataRoot,
    bookCallUrl,
    adminEmail,
    senderEmail,
    processorSecret,
    reviewRequired: process.env.DEEP_REPORT_REVIEW_REQUIRED !== 'false',
    appUrl,
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

