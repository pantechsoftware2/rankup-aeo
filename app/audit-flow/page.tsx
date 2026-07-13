import type { Metadata } from 'next';
import AuditConversionFlow from '@/components/AuditConversionFlow';
import { buildPageMetadata, getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo';

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
  const pageJsonLd = getWebPageJsonLd({
    name: 'AI Visibility Audit',
    description:
      'Free SEO and AEO audit flow for finding Google, ChatGPT, Gemini, and Perplexity visibility gaps before requesting a custom deep report.',
    path: '/audit-flow',
  });
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'AI Visibility Audit', path: '/audit-flow' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AuditConversionFlow />
    </>
  );
}
