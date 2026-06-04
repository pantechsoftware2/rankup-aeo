import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';
import { buildPageMetadata, getHomepageFaqJsonLd, getServiceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO + AEO for Businesses That Need More Google Visibility',
  description:
    'Run a free audit to see why your business is not getting found on Google and AI answer engines, then request a custom deep report and 90-day SEO + AEO growth plan.',
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
