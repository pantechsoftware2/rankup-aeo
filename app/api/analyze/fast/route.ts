import { NextResponse } from 'next/server';
import { performFastScan } from '@/lib/fast-scan';
import { applyRateLimit, isUserUrlValidationError, validatePublicAuditUrl } from '@/lib/security';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const rateLimit = applyRateLimit(req, {
      key: 'analyze-fast',
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait and try again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = await validatePublicAuditUrl(url);
    const result = await performFastScan(normalizedUrl);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Fast Analyze] Failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected error' },
      { status: isUserUrlValidationError(error?.message || '') ? 400 : 500 }
    );
  }
}
