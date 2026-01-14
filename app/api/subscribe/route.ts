import { NextResponse } from "next/server";

/**
 * Subscribe Route - Handles "Get Full Audit" email trigger
 * 
 * This route:
 * 1. Validates the email address
 * 2. Sends a transactional email via Brevo with the audit report data
 * 3. Optionally adds the contact to the Brevo list for future communications
 * 
 * Future: Will trigger deep blog audit analysis before sending email
 */
export async function POST(req: Request) {
  try {
    const { email, reportData } = await req.json();
    
    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: true, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('❌ BREVO_API_KEY not configured');
      return NextResponse.json(
        { error: true, message: 'Email service not configured' },
        { status: 500 }
      );
    }

    console.log(`\n📧 Sending Full Audit email to: ${email}`);
    console.log(`   Report data included: ${reportData ? 'Yes' : 'No'}`);

    // Step 1: Add contact to Brevo list (for future communications)
    try {
      const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          email: email,
          updateEnabled: true,
          attributes: {
            SIGNUP_DATE: new Date().toISOString(),
            SOURCE: 'AEO_FULL_AUDIT',
            LAST_AUDIT_DATE: new Date().toISOString()
          }
        })
      });

      if (contactResponse.ok) {
        console.log('   ✓ Contact added to Brevo list');
      } else {
        const error = await contactResponse.json();
        if (error.code === 'duplicate_parameter') {
          console.log('   ℹ️  Contact already exists in Brevo');
        } else {
          console.warn('   ⚠️  Failed to add contact:', error);
        }
      }
    } catch (error) {
      console.warn('   ⚠️  Contact creation failed (non-critical):', error);
    }

    // Step 2: Send transactional email with audit report
    const emailPayload = {
      sender: {
        name: 'AEO Audit Tool',
        email: 'noreply@aeo-audit.com'
      },
      to: [
        {
          email: email
        }
      ],
      subject: 'Your Full AEO Audit Report is Ready! 🚀',
      htmlContent: generateAuditEmailHTML(reportData),
      textContent: generateAuditEmailText(reportData)
    };

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      console.error('❌ Brevo email send error:', error);
      return NextResponse.json(
        { error: true, message: 'Failed to send email' },
        { status: 500 }
      );
    }

    const result = await emailResponse.json();
    console.log(`✅ Email sent successfully! Message ID: ${result.messageId}\n`);

    return NextResponse.json({
      success: true,
      message: 'Full audit email sent successfully',
      messageId: result.messageId
    });

  } catch (error: any) {
    console.error('❌ Subscribe route error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generates HTML email content for the audit report
 */
function generateAuditEmailHTML(reportData: any): string {
  const brandName = reportData?.brandName || 'Your Brand';
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // If we have full report data, include insights
  let insightsSection = '';
  if (reportData?.report) {
    const report = reportData.report;
    insightsSection = `
      <h2 style="color: #2563eb; margin-top: 30px;">Key Findings</h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Overall Sentiment:</strong> ${report.overallSentiment || 'Analyzing...'}</p>
        <p><strong>Top Strength:</strong> ${report.strengths?.[0] || 'Strong market presence'}</p>
        <p><strong>Priority Opportunity:</strong> ${report.contentGaps?.[0] || 'Expand content coverage'}</p>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Full AEO Audit is Ready! 🚀</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Great news! We've completed a comprehensive Answer Engine Optimization audit for <strong>${brandName}</strong>.</p>
        
        ${insightsSection}
        
        <h2 style="color: #2563eb; margin-top: 30px;">What's Included in Your Audit</h2>
        <ul style="line-height: 2;">
          <li>✓ Sentiment Analysis across search results</li>
          <li>✓ Competitor positioning insights</li>
          <li>✓ Content gap identification</li>
          <li>✓ Actionable optimization recommendations</li>
          <li>✓ Priority action items ranked by impact</li>
        </ul>
        
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 25px 0;">
          <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Focus on the Priority Actions first for maximum impact on your Answer Engine visibility.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-audit.com'}/audit-flow" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View Your Full Report
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          Generated on ${timestamp}<br>
          Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-audit.com'}" style="color: #2563eb;">help center</a>.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates plain text email content for the audit report
 */
function generateAuditEmailText(reportData: any): string {
  const brandName = reportData?.brandName || 'Your Brand';
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
Your Full AEO Audit is Ready!

Great news! We've completed a comprehensive Answer Engine Optimization audit for ${brandName}.

What's Included in Your Audit:
- Sentiment Analysis across search results
- Competitor positioning insights
- Content gap identification
- Actionable optimization recommendations
- Priority action items ranked by impact

View your full report: ${process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-audit.com'}/audit-flow

Generated on ${timestamp}

Questions? Reply to this email or visit our help center.
  `;
}
