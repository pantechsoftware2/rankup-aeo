import { NextResponse } from 'next/server';
import { createDeepReportJob } from '@/lib/report-jobs';
import { buildReviewUrl, getLeadEmailConfig, isLikelyValidPhone, isValidEmail, normalizePhone, sendBrevoEmail } from '@/lib/lead-capture';
import { writeLeadLog } from '@/lib/lead-log';
import type { LeadSource } from '@/types/consulting-report';

function inferBrandName(website?: string, reportData?: any) {
  if (reportData?.fast?.classification?.niche) {
    return reportData.fast.classification.niche;
  }

  if (!website) {
    return 'your site';
  }

  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

export async function POST(req: Request) {
  try {
    const { email, name, phone, company, website, source, reportData } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: true, message: 'Invalid email address' }, { status: 400 });
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: true, message: 'Name is required' }, { status: 400 });
    }

    if (!phone || !isLikelyValidPhone(phone)) {
      return NextResponse.json({ error: true, message: 'A valid phone number is required' }, { status: 400 });
    }

    if (!website) {
      return NextResponse.json({ error: true, message: 'Website is required' }, { status: 400 });
    }

    const brandLabel = inferBrandName(website, reportData);
    const job = await createDeepReportJob({
      source: (source || 'report_preview_gate') as LeadSource,
      website,
      brandName: brandLabel,
      lead: {
        name: name.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
        company: company?.trim() || undefined,
      },
    });

    const { adminEmail, appUrl, bookDemoUrl } = getLeadEmailConfig();
    const callToActionUrl = bookDemoUrl || `${appUrl}/audit-flow`;
    const reviewUrl = buildReviewUrl(`/review/${job.id}`);

    await writeLeadLog('deep-report-request', {
      source: job.source,
      jobId: job.id,
      website: job.website,
      brandName: job.brandName,
      name: job.lead.name,
      email: job.lead.email,
      phone: job.lead.phone,
      company: job.lead.company || null,
    });

    await sendBrevoEmail({
      to: [{ email: adminEmail }],
      subject: `New custom report request: ${name} (${brandLabel})`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
          <div style="background:#0f172a;color:white;padding:24px;border-radius:16px;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;">New Lead Captured</div>
            <h1 style="margin:8px 0 0;font-size:28px;">Custom deep-report request</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
            <p><strong>${name}</strong> requested a custom report for <strong>${website}</strong>.</p>
            <p>Email: ${email}<br />Phone: ${normalizePhone(phone)}<br />Company: ${company || 'Not provided'}<br />Job ID: ${job.id}</p>
            <p><a href="${reviewUrl}" style="display:inline-block;background:#111827;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">Open Review Queue</a></p>
          </div>
        </div>
      `,
      textContent: `Custom report request\nName: ${name}\nEmail: ${email}\nPhone: ${normalizePhone(phone)}\nWebsite: ${website}\nJob ID: ${job.id}\nReview: ${reviewUrl}`,
      replyTo: { email, name },
    });

    await sendBrevoEmail({
      to: [{ email, name }],
      subject: 'Your custom RankUp report is being prepared',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
          <div style="background:#052e16;color:white;padding:24px;border-radius:16px;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#86efac;">Request Received</div>
            <h1 style="margin:8px 0 0;font-size:28px;">We’re preparing your custom SEO + GEO report</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
            <p>Hi ${name},</p>
            <p>We received your request for <strong>${website}</strong>. The instant scan gave you the teaser; the deeper consultant-style report is being prepared now and will be sent to this inbox as a PDF.</p>
            <p>Job ID: <code>${job.id}</code></p>
            <div style="background:#111827;color:white;border-radius:12px;padding:18px;margin:20px 0;">
              <div style="font-weight:700;margin-bottom:8px;">Want to review it live with us?</div>
              <div style="color:#d1d5db;">Book the paid strategy call now so we can walk through priorities, rollout order, and whether we should handle implementation.</div>
            </div>
            <a href="${callToActionUrl}" style="display:inline-block;background:#111827;color:white;padding:14px 26px;border-radius:10px;text-decoration:none;font-weight:700;">
              Book Paid Strategy Call
            </a>
          </div>
        </div>
      `,
      textContent: `We received your request for ${website}. The custom report is being prepared and will be emailed as a PDF. Book the paid strategy call: ${callToActionUrl}`,
      replyTo: { email: adminEmail, name: 'RankUp AEO' },
    });

    return NextResponse.json({
      success: true,
      message: 'Custom report request submitted successfully',
      jobId: job.id,
    });
  } catch (error: any) {
    console.error('Custom report request error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
