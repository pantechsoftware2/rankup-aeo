import { buildReviewUrl, getLeadEmailConfig, sendBrevoEmail } from '@/lib/lead-capture';
import type { ConsultingAuditReport, DeepReportJob } from '@/types/consulting-report';

export async function sendDeepReportReadyEmail(job: DeepReportJob, report: ConsultingAuditReport, pdfBuffer: Buffer) {
  const { adminEmail } = getLeadEmailConfig();
  const base64Pdf = pdfBuffer.toString('base64');

  await sendBrevoEmail({
    to: [{ email: job.lead.email, name: job.lead.name }],
    subject: `${report.brandName} SEO + GEO audit report`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
        <div style="background:#0f172a;color:white;padding:24px;border-radius:16px;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;">Custom Report Ready</div>
          <h1 style="margin:10px 0 0;font-size:28px;">Your SEO + GEO audit is ready</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
          <p>Hi ${job.lead.name},</p>
          <p>We finished the custom audit for <strong>${report.website}</strong>. Your composite score is <strong>${report.compositeScore}/100</strong>.</p>
          <p>The PDF is attached. It shows the high-level diagnosis and the first areas to address, while we keep the exact rollout sequence and playbook for the strategy call.</p>
          <div style="margin:24px 0;padding:18px;background:#111827;color:white;border-radius:12px;">
            <div style="font-weight:700;margin-bottom:6px;">Next step</div>
            <div>${report.nextStepCTA.description}</div>
          </div>
          <div style="margin-top:24px;">
            <a href="${report.nextStepCTA.href}" style="display:inline-block;background:#111827;color:white;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;">
              ${report.nextStepCTA.label}
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: `Your custom audit for ${report.website} is ready.\nComposite score: ${report.compositeScore}/100.\nNext step: ${report.nextStepCTA.label} - ${report.nextStepCTA.href}`,
    replyTo: { email: adminEmail, name: 'RankUp AEO' },
    attachments: [
      {
        name: `${report.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-seo-geo-audit.pdf`,
        content: base64Pdf,
      },
    ],
  });
}

export async function sendDeepReportReviewReadyAdminEmail(job: DeepReportJob) {
  const { adminEmail } = getLeadEmailConfig();
  const reviewUrl = buildReviewUrl(`/review/${job.id}`);
  const queueUrl = buildReviewUrl('/review');

  await sendBrevoEmail({
    to: [{ email: adminEmail }],
    subject: `Review ready: ${job.brandName} (${job.website})`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
        <div style="background:#111827;color:white;padding:24px;border-radius:16px;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#86efac;">Review Needed</div>
          <h1 style="margin:10px 0 0;font-size:28px;">A custom report is ready for review</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
          <p><strong>${job.brandName}</strong> is now in <strong>${job.status}</strong>.</p>
          <p>Lead: ${job.lead.name} (${job.lead.email})<br />Website: ${job.website}<br />Job ID: ${job.id}</p>
          <p style="margin-top:20px;">
            <a href="${reviewUrl}" style="display:inline-block;background:#111827;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;margin-right:12px;">Open Job Review</a>
            <a href="${queueUrl}" style="display:inline-block;background:#f3f4f6;color:#111827;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">Open Review Queue</a>
          </p>
        </div>
      </div>
    `,
    textContent: `A custom report is ready for review.\nBrand: ${job.brandName}\nWebsite: ${job.website}\nLead: ${job.lead.name} (${job.lead.email})\nJob ID: ${job.id}\nReview job: ${reviewUrl}\nReview queue: ${queueUrl}`,
    replyTo: { email: job.lead.email, name: job.lead.name },
  });
}
