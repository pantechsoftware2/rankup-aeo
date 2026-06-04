import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/review', '/review/', '/report-preview', '/onboarding'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/review', '/review/', '/report-preview', '/onboarding'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/review', '/review/', '/report-preview', '/onboarding'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/review', '/review/', '/report-preview', '/onboarding'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/review', '/review/', '/report-preview', '/onboarding'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/review', '/review/', '/report-preview', '/onboarding'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
