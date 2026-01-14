import { NextRequest, NextResponse } from 'next/server';
import { generateAEOReport } from '@/lib/aeo-report-service';
import { AEOReportDataSchema } from '@/types/aeo-report';

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
    const body = await request.json();
    const { url, brandName } = body;

    // Validation
    if (!url || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields: url and brandName' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`📊 Generating AEO Report for: ${brandName} (${url})`);

    // Generate the report
    const reportData = await generateAEOReport(url, brandName);

    // Validate the response matches our schema
    const validatedData = AEOReportDataSchema.parse(reportData);

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error) {
    console.error('Error generating AEO report:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate AEO report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
