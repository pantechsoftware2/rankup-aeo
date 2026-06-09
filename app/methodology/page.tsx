import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  buildPageMetadata,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'RankUp AEO Methodology',
  description:
    'How RankUp AEO audits and improves technical SEO, content clarity, entity trust, structured data, and answer-engine citation readiness.',
  path: '/methodology',
  keywords: ['AEO methodology', 'SEO audit methodology', 'answer engine optimization process'],
});

const steps = [
  {
    title: 'Crawl and technical baseline',
    body: 'We check whether important pages are crawlable, indexable, canonicalized, internally linked, and technically clean enough to be trusted.',
  },
  {
    title: 'Entity and offer clarity',
    body: 'We identify whether the site clearly explains the business, its category, its services, its proof, and the entity relationships behind the brand.',
  },
  {
    title: 'Answer and citation readiness',
    body: 'We look for direct answers, FAQ coverage, decision-stage content, cited research, proof blocks, and structured data that make pages easier to summarize.',
  },
  {
    title: 'Commercial page prioritization',
    body: 'We prioritize service, industry, comparison, and methodology pages that can create qualified discovery rather than generic traffic.',
  },
  {
    title: '90-day implementation plan',
    body: 'We sequence the highest-leverage technical, content, trust, and authority fixes into a practical execution plan.',
  },
];

export default function MethodologyPage() {
  const pageJsonLd = getWebPageJsonLd({
    name: 'RankUp AEO Methodology',
    description:
      'RankUp AEO methodology for auditing and improving SEO, AEO, technical health, trust signals, structured data, and answer-engine readiness.',
    path: '/methodology',
  });
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Methodology', path: '/methodology' },
  ]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
          Methodology
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl font-space">
          A practical SEO and AEO system built around crawlability, trust, and better answers.
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-400">
          The method is simple: make the site technically accessible, make the business easier to
          understand, then make the important pages strong enough to rank, convert, and be cited.
        </p>

        <section className="mt-16 space-y-5">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:grid-cols-[120px_1fr]"
            >
              <div className="text-xs font-mono uppercase tracking-[0.24em] text-green-400">
                Step {index + 1}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-400">{step.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8">
          <h2 className="text-2xl font-bold font-space">Why this helps answer engines</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-300">
            Answer engines do not need magic files. They need reliable, crawlable pages that answer
            real questions, support claims, and make entity relationships clear. This methodology
            improves the same foundations that support Google rankings, Bing visibility, ChatGPT
            Search citations, and Google AI Overview eligibility.
          </p>
          <Link
            href="/audit-flow"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
          >
            Run the audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl font-bold font-space">No ranking guarantees</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
            RankUp AEO does not guarantee rankings, AI Overview inclusion, ChatGPT mentions, or
            answer-engine citations. The work improves the technical, content, schema, trust, and
            internal-linking conditions that support visibility, but search platforms decide what
            they rank, cite, and summarize.
          </p>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}
