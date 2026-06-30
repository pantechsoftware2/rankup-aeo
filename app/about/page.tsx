import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  buildPageMetadata,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'About RankUp AEO',
  description:
    'RankUp AEO helps businesses improve Google visibility, AI readiness, and qualified discovery with SEO, AEO, technical fixes, and proof-led content.',
  path: '/about',
  keywords: ['about RankUp AEO', 'SEO AEO agency', 'answer engine optimization team'],
});

export default function AboutPage() {
  const pageJsonLd = getWebPageJsonLd({
    type: 'AboutPage',
    name: 'About RankUp AEO',
    description:
      'RankUp AEO is an SEO and answer-engine optimization practice focused on technical cleanup, content clarity, entity trust, and citeable proof.',
    path: '/about',
  });
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
          About RankUp AEO
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl font-space">
          We help businesses become easier to find, easier to trust, and easier to cite.
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-400">
          RankUp AEO works on the visibility layer behind a business website: search intent,
          technical SEO, structured data, authority signals, and the answer-ready content that helps
          Google and AI search systems understand what the business does.
        </p>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            'Technical SEO and crawlability',
            'Answer-engine content structure',
            'Entity trust and proof signals',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <CheckCircle2 className="mb-4 h-6 w-6 text-green-400" />
              <h2 className="text-lg font-bold">{item}</h2>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold font-space">Why we exist</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-gray-300">
            <p>
              Search has become more compressed. Buyers still use Google, but they also ask
              ChatGPT, Perplexity, Gemini, Bing Copilot, and Google AI Overviews to summarize the
              research phase. That means a website has to do more than exist. It has to be clear,
              credible, and useful enough to be selected as a source.
            </p>
            <p>
              Our work treats SEO and AEO as one system. Good rankings, clean structure, strong
              proof, and clear answers all reinforce each other. The goal is not vanity traffic. The
              goal is more qualified discovery from people who are already looking for a solution.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl font-bold font-space">Entity and operator proof</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
            RankUp AEO is connected to the wider PanTech Software growth ecosystem and tests its
            SEO/AEO thinking on owned products such as Vizly. That matters because the strategy is
            not only theoretical; it is shaped by the same search, content, analytics, and
            conversion constraints clients face.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="https://www.pantechsoft.com/ai-marketing-agency-kolkata"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
            >
              PanTech Software
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://tryvizly.com"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
            >
              Vizly
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-green-500/20 bg-green-500/[0.06] p-8">
          <h2 className="text-2xl font-bold font-space">Start with the audit</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300">
            The fastest way to understand the opportunity is to run the visibility audit and see
            which pages, signals, and content gaps are holding the business back.
          </p>
          <Link
            href="/audit-flow"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
          >
            Run the audit
            <ArrowRight className="h-4 w-4" />
          </Link>
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
