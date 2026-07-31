import { NextResponse } from 'next/server';
import { getGoogleOAuthUrl } from '@/backend/services/auth.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = await getGoogleOAuthUrl(req);
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Google login could not be started.',
      },
      { status: 500 }
    );
  }
}
