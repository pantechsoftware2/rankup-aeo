import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://www.rankupaeo.com';
const SITE_NAME = 'RankUp AEO';
const DEFAULT_TITLE = 'RankUp AEO | SEO + AEO Visibility Growth for Businesses';
const DEFAULT_DESCRIPTION =
  'RankUp helps businesses with websites improve Google visibility, AI answer visibility, and trust signals through SEO and AEO audits, deep reports, and 90-day implementation retainers.';
const DEFAULT_OG_IMAGE = '/og/default.png';

export const ENTITY_PROFILES = [
  'https://www.pantechsoft.com/ai-marketing-agency-kolkata',
  'https://tryvizly.com',
];

function normalizeBaseUrl(value?: string) {
  const candidate = value?.trim() || DEFAULT_SITE_URL;
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
}

function isLocalhostUrl(value: string) {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

export function getSiteUrl() {
  const siteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (process.env.NODE_ENV === 'production' && isLocalhostUrl(siteUrl)) {
    return DEFAULT_SITE_URL;
  }

  return siteUrl;
}

export function absoluteUrl(path = '/') {
  const siteUrl = getSiteUrl();
  return path === '/' ? siteUrl : `${siteUrl}${path}`;
}

export function getDefaultOgImage() {
  return {
    url: absoluteUrl(DEFAULT_OG_IMAGE),
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} SEO and AEO visibility audit`,
  };
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
    title: {
      absolute: input.title,
    },
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
      images: [getDefaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [getDefaultOgImage().url],
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
      images: [getDefaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [getDefaultOgImage().url],
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
      apple: '/logo.png',
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl('/logo.png'),
    description: DEFAULT_DESCRIPTION,
    sameAs: ENTITY_PROFILES,
    areaServed: ['United States', 'India', 'Worldwide'],
    knowsAbout: [
      'Search engine optimization',
      'Answer engine optimization',
      'Google AI Overviews',
      'ChatGPT Search visibility',
      'Technical SEO',
      'Structured data',
      'Content strategy',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: absoluteUrl('/contact'),
      availableLanguage: ['English'],
    },
    founder: {
      '@type': 'Organization',
      name: 'PanTech Software',
      url: 'https://www.pantechsoft.com/ai-marketing-agency-kolkata',
    },
  };
}

export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function getServiceJsonLd(input?: {
  name?: string;
  description?: string;
  url?: string;
  serviceType?: string;
  audience?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input?.name || 'SEO and AEO visibility retainer',
    serviceType: input?.serviceType || 'SEO and AEO visibility retainer',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    areaServed: 'Worldwide',
    audience: input?.audience,
    description:
      input?.description ||
      'Custom SEO and AEO visibility service for businesses that want stronger discoverability in Google, ChatGPT, Gemini, Perplexity, and AI answer engines.',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: input?.url || absoluteUrl('/audit-flow'),
    },
  };
}

export function getFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getArticleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  keywords?: string[];
  citations?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    image: input.image || absoluteUrl(DEFAULT_OG_IMAGE),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(input.path),
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getSiteUrl(),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    about: input.keywords,
    citation: input.citations,
  };
}

export function getWebPageJsonLd(input: {
  type?: 'WebPage' | 'AboutPage' | 'ContactPage';
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': input.type || 'WebPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function getHomepageFaqJsonLd() {
  return getFaqJsonLd([
    {
      question: 'What does RankUp actually fix?',
      answer:
        'RankUp fixes the visibility system behind the website, including search intent alignment, page structure, messaging clarity, schema, authority signals, and the proof blocks that help Google and AI answer engines trust the business.',
    },
    {
      question: 'Is this SEO or AEO?',
      answer:
        'It is both. SEO gets a business into the ranking conversation, while AEO improves how often that business is cited and chosen inside answer engines like ChatGPT, Gemini, Perplexity, and Google AI Overviews.',
    },
    {
      question: 'What kinds of businesses are a fit?',
      answer:
        'Any real business with a website that wants more qualified discovery can be a fit. The work is not limited to software companies. If customers can search for the service or category, RankUp can usually improve visibility and credibility.',
    },
    {
      question: 'What happens after the audit?',
      answer:
        'After the audit, the business gets a diagnosis, a surface-level action plan, and a recommendation on whether a 90-day retainer is the right next step. That retainer focuses on the highest-leverage fixes first.',
    },
  ]);
}
