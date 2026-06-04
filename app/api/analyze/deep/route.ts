import { NextResponse } from "next/server";
import { performDeepScan } from '@/lib/deep-scan';
import type { DeepAuditReport } from '@/types/deep-audit';

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { crawl, fast } = await req.json();
    if (!crawl || !fast) {
      return NextResponse.json({ success: false, error: 'Missing crawl or fast payload' }, { status: 400 });
    }

    const result = await performDeepScan(crawl, fast);
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Deep Scan Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}