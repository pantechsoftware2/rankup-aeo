import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';
import {
  buildPageMetadata,
  getBreadcrumbJsonLd,
  getHomepageFaqJsonLd,
  getServiceJsonLd,
  getWebPageJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO + AEO for Businesses That Need More Google Visibility',
  description:
    'Run a free SEO and AEO audit to find Google and AI visibility gaps, then request a custom report and 90-day growth plan.',
  path: '/',
  keywords: [
    'SEO audit',
    'AEO audit',
    'Google visibility',
    'AI search audit',
    'small business SEO agency',
    'answer engine optimization',
    'ChatGPT visibility',
    'Google AI Overviews optimization',
    'SEO retainer',
  ],
});

export default function HomePage() {
  const serviceJsonLd = getServiceJsonLd();
  const faqJsonLd = getHomepageFaqJsonLd();
  const pageJsonLd = getWebPageJsonLd({
    name: 'RankUp AEO',
    description:
      'SEO and AEO visibility audits, deep reports, and 90-day retainers for businesses that need stronger Google and AI search discovery.',
    path: '/',
  });
  const breadcrumbJsonLd = getBreadcrumbJsonLd([{ name: 'Home', path: '/' }]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
