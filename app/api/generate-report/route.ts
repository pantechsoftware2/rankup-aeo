import { NextRequest, NextResponse } from 'next/server';
import { performFastScan } from '@/lib/fast-scan';
import { performDeepScan } from '@/lib/deep-scan';
import { applyRateLimit, isUserUrlValidationError, validatePublicAuditUrl } from '@/lib/security';
import { debugLog } from '@/lib/logger';
import type { DeepAuditReport } from '@/types/deep-audit';

/**
 * POST /api/generate-report
 * 
 * Generates a comprehensive AEO report for a given brand and URL
 * 
 * Request Body:
 * {
 *   "url": "https://example.com",
 *   "brandName": "Example Brand"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimit = applyRateLimit(request, {
      key: 'generate-report',
      limit: 6,
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

    const body = await request.json();
    const { url, brandName } = body;

    // Validation
    if (!url || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields: url and brandName' },
        { status: 400 }
      );
    }

    const normalizedUrl = await validatePublicAuditUrl(url);

    debugLog('[Generate Report] Generating AEO report.', { brandName, url: normalizedUrl });

    // Run fast -> deep to produce an audit report
    const fastResult = await performFastScan(normalizedUrl);
    const deepResult = await performDeepScan(fastResult.crawl, fastResult.fast);

    const report: DeepAuditReport | null = deepResult?.report || null;

    return NextResponse.json({ success: true, report, raw: { fast: fastResult, deep: deepResult } });
  } catch (error) {
    console.error('Error generating AEO report:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate AEO report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: isUserUrlValidationError(error instanceof Error ? error.message : '') ? 400 : 500 }
    );
  }
}
