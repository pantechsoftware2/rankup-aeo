import type { Metadata } from 'next';
import AuditConversionFlow from '@/components/AuditConversionFlow';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AI Visibility Audit',
  description:
    'See how your brand looks to Google, ChatGPT, Gemini, and Perplexity, then request a custom deep report with prioritized fixes.',
  path: '/audit-flow',
  keywords: [
    'AI visibility audit',
    'AEO audit',
    'SEO and GEO audit',
    'ChatGPT audit',
    'Perplexity audit',
  ],
});

export default function AuditFlowPage() {
  return <AuditConversionFlow />;
}
