import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLandingPage, getLandingPageDepth, getLandingPages } from '@/lib/landing-pages';
import {
  absoluteUrl,
  getBreadcrumbJsonLd,
  getDefaultOgImage,
  getFaqJsonLd,
  getServiceJsonLd,
} from '@/lib/seo';

export function generateStaticParams() {
  return getLandingPages('service').map((page) => ({ slug: page.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const page = getLandingPage('service', params.slug);

  if (!page) {
    return {};
  }

  const url = absoluteUrl(`/services/${page.slug}`);
  const ogImage = getDefaultOgImage();

  return {
    title: {
      absolute: page.metaTitle || page.title,
    },
    description: page.metaDescription || page.description,
    keywords: page.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description,
      url,
      siteName: 'RankUp AEO',
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.description,
      images: [ogImage.url],
    },
  };
}

export default function ServiceLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getLandingPage('service', params.slug);

  if (!page) {
    notFound();
  }

  const related = getLandingPages('service').filter((entry) => entry.slug !== page.slug).slice(0, 3);
  const depth = getLandingPageDepth(page.slug);

  return (
    <LandingPageTemplate
      page={page}
      depth={depth}
      backHref="/services"
      backLabel="Back to services"
      related={related}
      relatedBasePath="/services"
    />
  );
}

function LandingPageTemplate({
  page,
  depth,
  backHref,
  backLabel,
  related,
  relatedBasePath,
}: {
  page: NonNullable<ReturnType<typeof getLandingPage>>;
  depth: ReturnType<typeof getLandingPageDepth>;
  backHref: string;
  backLabel: string;
  related: ReturnType<typeof getLandingPages>;
  relatedBasePath: string;
}) {
  const url = absoluteUrl(`${relatedBasePath}/${page.slug}`);
  const serviceJsonLd = getServiceJsonLd({
    name: page.title,
    description: page.description,
    url,
    serviceType: page.title,
    audience: 'Businesses that need stronger Google and AI search visibility',
  });
  const faqJsonLd = getFaqJsonLd([
    ...page.faqs,
    ...(depth?.decisionFaqs || []),
    ...(depth?.comparisonQuestions || []),
  ]);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: page.title, path: `${relatedBasePath}/${page.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
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

        {depth ? (
          <section className="mt-12 rounded-3xl border border-green-500/20 bg-green-500/[0.06] p-8">
            <p className="mb-3 text-xs font-mono uppercase tracking-[0.24em] text-green-400">
              Direct answer
            </p>
            <p className="text-xl font-semibold leading-8 text-white">{depth.directAnswer}</p>
          </section>
        ) : null}

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

        {depth ? (
          <>
            <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-3xl font-bold font-space">What this service is</h2>
                <p className="mt-4 text-sm leading-7 text-gray-500">
                  Built for buyers and answer engines that need the plain explanation before the
                  longer evaluation.
                </p>
              </div>
              <div className="space-y-5 text-base leading-8 text-gray-300">
                {depth.whatThisIs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="mt-16 grid gap-8 lg:grid-cols-2">
              <InfoList title="Who it is for" items={depth.whoFor} />
              <InfoList title="Problems solved" items={depth.problemsSolved} />
            </section>

            <section className="mt-16 grid gap-8 lg:grid-cols-2">
              <InfoList title="Process" items={depth.process} />
              <InfoList title="Deliverables" items={depth.deliverables} />
            </section>

            {depth.roadmap ? (
              <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <h2 className="mb-8 text-3xl font-bold font-space">30/60/90 day roadmap</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {depth.roadmap.map((item) => (
                    <article key={item.phase} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                      <p className="mb-3 text-xs font-mono uppercase tracking-[0.22em] text-green-400">
                        {item.phase}
                      </p>
                      <p className="text-sm leading-7 text-gray-300">{item.details}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-16 grid gap-8 lg:grid-cols-2">
              <QuestionList title="Decision-stage FAQs" items={depth.decisionFaqs} />
              <QuestionList title="Comparison questions" items={depth.comparisonQuestions} />
            </section>

            <section className="mt-16 rounded-3xl border border-white/10 bg-[#0A0A0A] p-8">
              <h2 className="mb-5 text-2xl font-bold font-space">Useful next steps</h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/audit-flow" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-105">
                  Run the audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/industries" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-white/20">
                  See industries
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-white/20">
                  Read research
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/blog/how-to-make-content-citeable-in-ai-search" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-white/20">
                  Make content citeable
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </>
        ) : null}

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
              <p className="mt-2 text-gray-400">More rankable surfaces around the same buying problem.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.slug}
                href={`${relatedBasePath}/${entry.slug}`}
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
    </main>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
      <h2 className="mb-6 text-2xl font-bold font-space">{title}</h2>
      <ul className="space-y-4 text-sm leading-7 text-gray-300">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuestionList({ title, items }: { title: string; items: Array<{ question: string; answer: string }> }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
      <h2 className="mb-6 text-2xl font-bold font-space">{title}</h2>
      <div className="space-y-5">
        {items.map((item) => (
          <article key={item.question}>
            <h3 className="text-lg font-bold text-white">{item.question}</h3>
            <p className="mt-2 text-sm leading-7 text-gray-400">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
