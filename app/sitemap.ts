import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';
import { getLandingPages } from '@/lib/landing-pages';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllBlogPosts();
  const landingPages = getLandingPages();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/audit-flow'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: absoluteUrl('/methodology'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.72,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/services'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: absoluteUrl('/industries'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
    ...landingPages.map((page) => ({
      url: absoluteUrl(`/${page.category === 'service' ? 'services' : 'industries'}/${page.slug}`),
      lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.68,
    })),
  ];
}
