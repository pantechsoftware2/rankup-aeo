import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getLandingPages } from '@/lib/landing-pages';
import { absoluteUrl, buildPageMetadata, getBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO and AEO Services',
  description:
    'Explore RankUp SEO and AEO services for businesses that need more Google visibility, stronger answer-engine citations, and clearer qualified discovery.',
  path: '/services',
  keywords: ['seo services', 'aeo services', 'seo and aeo agency', 'google visibility service'],
});

export default function ServicesIndexPage() {
  const pages = getLandingPages('service');
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
            Services
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl font-space">
            SEO and AEO services for businesses that need more qualified discovery.
          </h1>
          <p className="text-lg leading-relaxed text-gray-400">
            These are the core service surfaces we want Google and buyers to understand clearly.
            The work is different on the surface, but the job underneath is the same: make the
            business easier to find, easier to trust, and easier to choose.
          </p>
          <p className="mt-5 text-base leading-7 text-gray-400">
            For the content side of that work, read our guide on{' '}
            <Link
              href="/blog/how-to-make-content-citeable-in-ai-search"
              className="font-semibold text-white transition hover:text-green-300"
            >
              how to make content citeable in AI search
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {pages.map((page) => (
            <article
              key={page.slug}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <p className="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-zinc-500">
                {page.eyebrow}
              </p>
              <h2 className="mb-4 text-2xl font-bold text-white">{page.title}</h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">{page.excerpt}</p>
              <ul className="mb-8 space-y-3 text-sm text-gray-300">
                {page.bullets.slice(0, 3).map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${page.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
              >
                Read service page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'RankUp Services',
            url: absoluteUrl('/services'),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}
