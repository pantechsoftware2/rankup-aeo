import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLandingPage, getLandingPages } from '@/lib/landing-pages';
import { absoluteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return getLandingPages('industry').map((page) => ({ slug: page.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const page = getLandingPage('industry', params.slug);

  if (!page) {
    return {};
  }

  const url = absoluteUrl(`/industries/${page.slug}`);

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: 'RankUp AEO',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  };
}

export default function IndustryLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getLandingPage('industry', params.slug);

  if (!page) {
    notFound();
  }

  const related = getLandingPages('industry').filter((entry) => entry.slug !== page.slug).slice(0, 3);
  const url = absoluteUrl(`/industries/${page.slug}`);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/industries"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to industries
        </Link>

        <section className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
              {page.eyebrow}
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl font-space">
              {page.heroTitle}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-gray-400">{page.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {page.keywords.slice(0, 3).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-zinc-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="mb-4 text-2xl font-bold">{page.outcomeTitle}</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">{page.outcomeBody}</p>
            <ul className="space-y-3 text-sm text-gray-200">
              {page.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/audit-flow"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
            >
              Run the audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-8">
            <h2 className="mb-6 text-2xl font-bold font-space">Where this usually breaks</h2>
            <ul className="space-y-4 text-gray-300">
              {page.problems.map((problem) => (
                <li key={problem} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-8">
            <h2 className="mb-6 text-2xl font-bold font-space">How we attack it</h2>
            <ul className="space-y-4 text-gray-300">
              {page.approach.map((step) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="mb-6 text-3xl font-bold font-space">Frequently asked</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <h3 className="mb-3 text-xl font-bold">{faq.question}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold font-space">Related pages</h2>
              <p className="mt-2 text-gray-400">More surfaces around adjacent buying intent.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.slug}
                href={`/industries/${entry.slug}`}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <p className="mb-3 text-xs font-mono uppercase tracking-[0.22em] text-zinc-500">
                  {entry.eyebrow}
                </p>
                <h3 className="mb-3 text-xl font-bold">{entry.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{entry.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: page.title,
            description: page.description,
            url,
            provider: {
              '@type': 'Organization',
              name: 'RankUp AEO',
              url: absoluteUrl('/'),
            },
          }),
        }}
      />
    </main>
  );
}
