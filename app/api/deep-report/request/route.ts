import { NextResponse } from 'next/server';
import { createDeepReportJob } from '@/lib/report-jobs';
import { buildReviewUrl, getLeadEmailConfig, isLikelyValidPhone, isValidEmail, normalizePhone, sendBrevoEmail } from '@/lib/lead-capture';
import { writeLeadLog } from '@/lib/lead-log';
import { validatePublicAuditUrl } from '@/lib/security';
import type { LeadSource } from '@/types/consulting-report';

function inferBrandName(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const website = await validatePublicAuditUrl(body?.website || body?.url);
    const source = (body?.source || 'unknown') as LeadSource;

    if (!body?.name || body.name.trim().length < 2) {
      return NextResponse.json({ error: true, message: 'Name is required' }, { status: 400 });
    }
    if (!body?.email || !isValidEmail(body.email)) {
      return NextResponse.json({ error: true, message: 'Valid email is required' }, { status: 400 });
    }
    if (!body?.phone || !isLikelyValidPhone(body.phone)) {
      return NextResponse.json({ error: true, message: 'Valid phone number is required' }, { status: 400 });
    }

    const brandName = inferBrandName(website);
    const job = await createDeepReportJob({
      source,
      website,
      brandName,
      lead: {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: normalizePhone(body.phone),
        company: body.company?.trim() || undefined,
      },
      notes: body.notes?.trim() || undefined,
    });

    const { adminEmail, appUrl, bookDemoUrl } = getLeadEmailConfig();
    const ctaUrl = bookDemoUrl || `${appUrl}/report-preview?url=${encodeURIComponent(website)}`;
    const reviewUrl = buildReviewUrl(`/review/${job.id}`);

    await writeLeadLog('deep-report-request', {
      source,
      jobId: job.id,
      website,
      brandName,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: normalizePhone(body.phone),
      company: body.company?.trim() || null,
    });

    await sendBrevoEmail({
      to: [{ email: adminEmail }],
      subject: `Queued custom report: ${body.name.trim()} (${brandName})`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
          <div style="background:#0f172a;color:white;padding:24px;border-radius:16px;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;">Custom Report Queue</div>
            <h1 style="margin:10px 0 0;font-size:28px;">New queued report request</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
            <p><strong>${body.name.trim()}</strong> requested a custom report for <strong>${website}</strong>.</p>
            <p>Email: ${body.email.trim()}<br />Phone: ${normalizePhone(body.phone)}<br />Job ID: ${job.id}</p>
            <p><a href="${reviewUrl}" style="display:inline-block;background:#111827;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">Open Review Queue</a></p>
          </div>
        </div>
      `,
      textContent: `Queued custom report\nName: ${body.name.trim()}\nEmail: ${body.email.trim()}\nPhone: ${normalizePhone(body.phone)}\nWebsite: ${website}\nJob ID: ${job.id}\nReview: ${reviewUrl}`,
      replyTo: { email: body.email.trim(), name: body.name.trim() },
    });

    await sendBrevoEmail({
      to: [{ email: body.email.trim(), name: body.name.trim() }],
      subject: `We’re preparing your custom audit for ${brandName}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:0 auto;padding:24px;">
          <div style="background:#0f172a;color:white;padding:24px;border-radius:16px;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;">Request Received</div>
            <h1 style="margin:10px 0 0;font-size:28px;">Your custom SEO + GEO report is in queue</h1>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
            <p>Hi ${body.name.trim()},</p>
            <p>We received your request for <strong>${website}</strong>. We’ll turn the live teaser into a deeper consultant-style report and send the PDF to this inbox once it’s ready.</p>
            <p>Job ID: <code>${job.id}</code></p>
            <p>While it’s being prepared, you can reserve the paid strategy call so we can review the findings with you and map the implementation order.</p>
            <p><a href="${ctaUrl}" style="display:inline-block;background:#111827;color:white;padding:14px 22px;border-radius:10px;text-decoration:none;font-weight:700;">Book Paid Strategy Call</a></p>
          </div>
        </div>
      `,
      textContent: `We received your custom report request for ${website}. Job ID: ${job.id}. Book your paid strategy call here: ${ctaUrl}`,
      replyTo: { email: adminEmail, name: 'RankUp AEO' },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Custom report request submitted successfully.',
    });
  } catch (error: any) {
    console.error('Deep report request error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to queue report request' },
      { status: 500 }
    );
  }
}
