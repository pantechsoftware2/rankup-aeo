import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://www.rankupaeo.com';
const SITE_NAME = 'RankUp AEO';
const DEFAULT_TITLE = 'RankUp AEO | SEO + AEO Visibility Growth for Businesses';
const DEFAULT_DESCRIPTION =
  'RankUp helps businesses with websites improve Google visibility, AI answer visibility, and trust signals through SEO and AEO audits, deep reports, and 90-day implementation retainers.';

function normalizeBaseUrl(value?: string) {
  const candidate = value?.trim() || DEFAULT_SITE_URL;
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
}

export function getSiteUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
}

export function absoluteUrl(path = '/') {
  const siteUrl = getSiteUrl();
  return path === '/' ? siteUrl : `${siteUrl}${path}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(input.path || '/');

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : undefined,
  };
}

export function getRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
      'AEO agency',
      'SEO GEO audit',
      'AI search optimization',
      'ChatGPT SEO',
      'Perplexity SEO',
      'Google AI Overviews optimization',
      'AI visibility audit',
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'marketing',
    alternates: {
      canonical: absoluteUrl('/'),
      types: {
        'application/rss+xml': absoluteUrl('/feed.xml'),
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    },
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: absoluteUrl('/'),
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl('/logo.png'),
    sameAs: [],
  };
}

export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
  };
}

export function getServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'SEO and AEO visibility retainer',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    areaServed: 'Worldwide',
    description:
      'Custom SEO and AEO visibility service for businesses that want stronger discoverability in Google, ChatGPT, Gemini, Perplexity, and AI answer engines.',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl('/audit-flow'),
    },
  };
}

export function getHomepageFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does RankUp actually fix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RankUp fixes the visibility system behind the website, including search intent alignment, page structure, messaging clarity, schema, authority signals, and the proof blocks that help Google and AI answer engines trust the business.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this SEO or AEO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It is both. SEO gets a business into the ranking conversation, while AEO improves how often that business is cited and chosen inside answer engines like ChatGPT, Gemini, Perplexity, and Google AI Overviews.',
        },
      },
      {
        '@type': 'Question',
        name: 'What kinds of businesses are a fit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Any real business with a website that wants more qualified discovery can be a fit. The work is not limited to software companies. If customers can search for the service or category, RankUp can usually improve visibility and credibility.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens after the audit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After the audit, the business gets a diagnosis, a surface-level action plan, and a recommendation on whether a 90-day retainer is the right next step. That retainer focuses on the highest-leverage fixes first.',
        },
      },
    ],
  };
}
