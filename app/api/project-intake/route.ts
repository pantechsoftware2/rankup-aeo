import { NextResponse } from "next/server";
import {
  getLeadEmailConfig,
  isLikelyValidPhone,
  isValidEmail,
  normalizePhone,
  sendBrevoEmail,
} from "@/lib/lead-capture";
import { writeLeadLog } from '@/lib/lead-log';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Validate required fields
    if (!payload.plan || !payload.keywords || !Array.isArray(payload.keywords)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (payload.keywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 });
    }

    if (!payload.name || payload.name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!payload.email || !isValidEmail(payload.email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!payload.phone || !isLikelyValidPhone(payload.phone)) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    // Log the intake data
    console.log('📊 Project Intake Received:', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      plan: payload.plan,
      planName: payload.planName,
      planPrice: payload.planPrice,
      keywordsCount: payload.keywords.length,
      timestamp: payload.submittedAt
    });

    const normalizedPhone = normalizePhone(payload.phone);
    const source = payload.source || 'implementation_intake';
    const { adminEmail, appUrl, bookDemoUrl } = getLeadEmailConfig();
    const nextStepUrl = bookDemoUrl || `${appUrl}/audit-flow`;

    await writeLeadLog('project-intake', {
      source,
      name: payload.name,
      email: payload.email,
      phone: normalizedPhone,
      company: payload.company || null,
      plan: payload.plan,
      planName: payload.planName,
      planPrice: payload.planPrice,
      website: payload.scanUrl || null,
      keywords: payload.keywords,
    });

    await sendBrevoEmail({
      to: [{ email: adminEmail }],
      subject: `New ${payload.planName} intake: ${payload.name}`,
      htmlContent: generateAdminIntakeEmailHTML({
        ...payload,
        phone: normalizedPhone,
      }),
      textContent: generateAdminIntakeEmailText({
        ...payload,
        phone: normalizedPhone,
      }),
      replyTo: { email: payload.email, name: payload.name },
    });

    await sendBrevoEmail({
      to: [{ email: payload.email, name: payload.name }],
      subject: `We received your ${payload.planName} AEO request`,
      htmlContent: generateLeadConfirmationHTML({
        name: payload.name,
        planName: payload.planName,
        website: payload.scanUrl,
        keywords: payload.keywords,
        nextStepUrl,
      }),
      textContent: generateLeadConfirmationText({
        name: payload.name,
        planName: payload.planName,
        website: payload.scanUrl,
        keywords: payload.keywords,
        nextStepUrl,
      }),
      replyTo: { email: adminEmail, name: 'RankUp AEO' },
    });

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Project intake received successfully',
      data: {
        plan: payload.plan,
        keywordsCount: payload.keywords.length,
        email: payload.email,
      }
    });

  } catch (error: any) {
    console.error('❌ Project intake error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process project intake' 
    }, { status: 500 });
  }
}

function generateAdminIntakeEmailHTML(payload: any) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 680px; margin: 0 auto; padding: 24px;">
        <div style="background:#111827;color:white;padding:24px;border-radius:16px 16px 0 0;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#86efac;">New Intake</div>
          <h1 style="margin:8px 0 0;font-size:28px;">${payload.planName} plan request</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px;background:white;">
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 8px;"><strong>Name:</strong> ${payload.name}</p>
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${payload.email}</p>
            <p style="margin:0 0 8px;"><strong>Phone:</strong> ${payload.phone}</p>
            <p style="margin:0 0 8px;"><strong>Company:</strong> ${payload.company || 'Not provided'}</p>
            <p style="margin:0 0 8px;"><strong>Website:</strong> ${payload.scanUrl || 'Not provided'}</p>
            <p style="margin:0;"><strong>Plan:</strong> ${payload.planName} ($${payload.planPrice}/month)</p>
          </div>
          <h2 style="font-size:18px;margin:0 0 12px;">Target prompts / keywords</h2>
          <ol style="padding-left:20px;margin:0;">
            ${payload.keywords.map((keyword: string) => `<li style="margin-bottom:8px;">${keyword}</li>`).join('')}
          </ol>
        </div>
      </body>
    </html>
  `;
}

function generateAdminIntakeEmailText(payload: any) {
  return [
    `New ${payload.planName} plan request`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Company: ${payload.company || 'Not provided'}`,
    `Website: ${payload.scanUrl || 'Not provided'}`,
    `Plan: ${payload.planName} ($${payload.planPrice}/month)`,
    '',
    'Target prompts / keywords:',
    ...payload.keywords.map((keyword: string, index: number) => `${index + 1}. ${keyword}`),
  ].join('\n');
}

function generateLeadConfirmationHTML(input: {
  name: string;
  planName: string;
  website?: string;
  keywords: string[];
  nextStepUrl: string;
}) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 680px; margin: 0 auto; padding: 24px;">
        <div style="background:#052e16;color:white;padding:24px;border-radius:16px 16px 0 0;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#86efac;">Request Received</div>
          <h1 style="margin:8px 0 0;font-size:28px;">We have your ${input.planName} plan request</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:24px;background:white;">
          <p style="margin-top:0;">Hi ${input.name},</p>
          <p>We received your target prompts for ${input.website || 'your site'} and we will review them before the strategy handoff.</p>
          <h2 style="font-size:18px;margin:0 0 12px;">What you asked us to prioritize</h2>
          <ul style="padding-left:18px;">
            ${input.keywords.slice(0, 5).map((keyword) => `<li style="margin-bottom:8px;">${keyword}</li>`).join('')}
          </ul>
          <div style="background:#111827;color:white;border-radius:12px;padding:18px;margin-top:20px;">
            <div style="font-weight:700;margin-bottom:8px;">Next step:</div>
            <div style="color:#d1d5db;">Book the strategy call so we can prioritize the rollout and assign the highest-impact fixes first.</div>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${input.nextStepUrl}" style="display:inline-block;background:#111827;color:white;padding:14px 26px;border-radius:10px;text-decoration:none;font-weight:700;">
              Book Strategy Call
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateLeadConfirmationText(input: {
  name: string;
  planName: string;
  website?: string;
  keywords: string[];
  nextStepUrl: string;
}) {
  return `
Hi ${input.name},

We received your ${input.planName} plan request for ${input.website || 'your site'}.

Top prompts:
${input.keywords.slice(0, 5).map((keyword, index) => `${index + 1}. ${keyword}`).join('\n')}

Next step: book the strategy call so we can prioritize the rollout and assign the highest-impact fixes first.
${input.nextStepUrl}
  `.trim();
}
