import { getLeadEmailConfig, sendTransactionalEmail } from '@/lib/lead-capture';
import type { OutboundProspect } from '@/types/outbound';

function getProspectEmail(prospect: OutboundProspect, explicitEmail?: string) {
  if (explicitEmail?.trim()) {
    return explicitEmail.trim();
  }

  return prospect.contact.emails[0] || null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendOutboundSnapshotEmail(args: {
  prospect: OutboundProspect;
  toEmail?: string;
  recipientName?: string;
}) {
  const { adminEmail, appUrl, bookDemoUrl } = getLeadEmailConfig();
  const toEmail = getProspectEmail(args.prospect, args.toEmail);

  if (!toEmail) {
    throw new Error('No outbound recipient email is available for this prospect.');
  }

  const firstName = args.recipientName?.trim() || args.prospect.companyName;
  const findingsHtml = args.prospect.snapshot.findings
    .map((finding) => `<li style="margin-bottom:8px;">${escapeHtml(finding)}</li>`)
    .join('');
  const findingsText = args.prospect.snapshot.findings.map((finding, index) => `${index + 1}. ${finding}`).join('\n');
  const ctaUrl = bookDemoUrl || `${appUrl}/audit-flow?url=${encodeURIComponent(args.prospect.website)}`;
  const contactLink = args.prospect.contact.contactPage
    ? `<p style="margin:0 0 16px;color:#4b5563;">Best contact page we found: <a href="${args.prospect.contact.contactPage}" style="color:#111827;">${escapeHtml(args.prospect.contact.contactPage)}</a></p>`
    : '';

  await sendTransactionalEmail({
    to: [{ email: toEmail, name: firstName }],
    subject: `Found 3 visibility leaks on ${args.prospect.companyName}`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
        <div style="background:#111827;color:white;padding:24px;border-radius:16px;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;">Quick Visibility Snapshot</div>
          <h1 style="margin:10px 0 0;font-size:28px;">${escapeHtml(args.prospect.companyName)} is easier to skip than it should be</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
          <p>Hi ${escapeHtml(firstName)},</p>
          <p>We ran a quick review on <strong>${escapeHtml(args.prospect.website)}</strong> and found a few places where Google and answer engines are likely underselling the business.</p>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin:20px 0;">
            <div style="font-weight:700;margin-bottom:10px;">What stood out</div>
            <ul style="padding-left:18px;margin:0;">
              ${findingsHtml}
            </ul>
          </div>
          <p>${escapeHtml(args.prospect.snapshot.implication)}</p>
          <p>${escapeHtml(args.prospect.snapshot.callToAction)}</p>
          ${contactLink}
          <div style="margin-top:24px;">
            <a href="${ctaUrl}" style="display:inline-block;background:#111827;color:white;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;">
              Book Strategy Call
            </a>
          </div>
        </div>
      </div>
    `,
    textContent: [
      `Hi ${firstName},`,
      '',
      `We ran a quick visibility review on ${args.prospect.website} and found a few places where Google and answer engines are likely underselling the business.`,
      '',
      'What stood out:',
      findingsText,
      '',
      args.prospect.snapshot.implication,
      args.prospect.snapshot.callToAction,
      '',
      `Book strategy call: ${ctaUrl}`,
    ].join('\n'),
    replyTo: { email: adminEmail, name: 'RankUp AEO' },
  });

  return {
    toEmail,
    ctaUrl,
  };
}
