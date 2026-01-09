import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    // Add contact to Brevo
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email: email,
        updateEnabled: true, // Update if exists
        attributes: {
          SIGNUP_DATE: new Date().toISOString(),
          SOURCE: 'AEO_TOOL'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      // If contact already exists, that's fine
      if (error.code === 'duplicate_parameter') {
        return NextResponse.json({ success: true, message: 'Email already subscribed' });
      }
      console.error('Brevo error:', error);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
