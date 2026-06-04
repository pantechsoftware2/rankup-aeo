import type { Metadata } from 'next';
import { Suspense } from 'react';
import ReportContent from './report-content';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildPageMetadata({
  title: 'Report Preview',
  description: 'Private preview of an in-progress audit report.',
  path: '/report-preview',
  noIndex: true,
});

export default function ReportPreviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading report preview...</div>}>
      <ReportContent />
    </Suspense>
  );
}
