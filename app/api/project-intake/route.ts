import { NextResponse } from "next/server";

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

    // Log the intake data
    console.log('📊 Project Intake Received:', {
      plan: payload.plan,
      planName: payload.planName,
      planPrice: payload.planPrice,
      keywordsCount: payload.keywords.length,
      keywords: payload.keywords,
      timestamp: payload.submittedAt
    });

    // TODO: SAVE TO DATABASE
    // Once you set up a database (Supabase, Firebase, Prisma, etc.), add the save logic here:
    // 
    // Example with Supabase:
    // const { data, error } = await supabase
    //   .from('project_intake')
    //   .insert([{
    //     plan: payload.plan,
    //     plan_name: payload.planName,
    //     plan_price: payload.planPrice,
    //     keywords: payload.keywords,
    //     submitted_at: payload.submittedAt,
    //     status: 'pending'
    //   }]);
    // 
    // if (error) throw error;
    //
    // Example with Prisma:
    // const intake = await prisma.projectIntake.create({
    //   data: {
    //     plan: payload.plan,
    //     planName: payload.planName,
    //     planPrice: payload.planPrice,
    //     keywords: payload.keywords,
    //     submittedAt: new Date(payload.submittedAt),
    //     status: 'pending'
    //   }
    // });

    // Send keyword notification email via Brevo
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': apiKey
          },
          body: JSON.stringify({
            sender: { email: 'noreply@yourapp.com', name: 'AEO Tool' },
            to: [{ email: process.env.ADMIN_EMAIL || 'admin@yourapp.com' }],
            subject: `New ${payload.planName} Plan Sign-up - Keywords Submission`,
            htmlContent: `
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    h2 { color: #4F46E5; }
                    .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
                    .keyword-list { background-color: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
                    .keyword-item { padding: 8px; border-bottom: 1px solid #e5e7eb; }
                    .keyword-item:last-child { border-bottom: none; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h2>🎯 New Project Intake Received</h2>
                    
                    <div class="info-box">
                      <p><strong>Plan Selected:</strong> ${payload.planName}</p>
                      <p><strong>Price:</strong> $${payload.planPrice}/month</p>
                      <p><strong>Total Keywords:</strong> ${payload.keywords.length}</p>
                      <p><strong>Submitted:</strong> ${new Date(payload.submittedAt).toLocaleString()}</p>
                    </div>
                    
                    <h3>Keywords List:</h3>
                    <div class="keyword-list">
                      ${payload.keywords.map((k: string, idx: number) => 
                        `<div class="keyword-item">${idx + 1}. ${k}</div>`
                      ).join('')}
                    </div>
                    
                    <div class="footer">
                      <p>This is an automated notification from your AEO Tool.</p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        });

        if (!response.ok) {
          throw new Error(`Brevo API error: ${response.status}`);
        }

        console.log('✅ Notification email sent successfully via Brevo');
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Project intake received successfully',
      data: {
        plan: payload.plan,
        keywordsCount: payload.keywords.length
      }
    });

  } catch (error: any) {
    console.error('❌ Project intake error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process project intake' 
    }, { status: 500 });
  }
}
