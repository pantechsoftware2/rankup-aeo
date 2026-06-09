import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail, MessageSquare } from 'lucide-react';
import {
  buildPageMetadata,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact RankUp AEO',
  description:
    'Contact RankUp AEO to discuss SEO, AEO, AI visibility audits, deep reports, and 90-day implementation retainers.',
  path: '/contact',
  keywords: ['contact RankUp AEO', 'SEO AEO consultation', 'AI visibility audit contact'],
});

export default function ContactPage() {
  const pageJsonLd = getWebPageJsonLd({
    type: 'ContactPage',
    name: 'Contact RankUp AEO',
    description:
      'Contact page for RankUp AEO SEO, AEO, AI visibility audits, reports, and implementation retainers.',
    path: '/contact',
  });
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
          Contact
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl font-space">
          Talk to RankUp AEO about your Google and AI visibility gaps.
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-400">
          Use the audit flow when you want a diagnosis first. Use direct contact when you already
          know the site needs technical SEO, content restructuring, entity cleanup, or a focused
          90-day implementation plan.
        </p>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <Link
            href="/audit-flow"
            className="rounded-3xl border border-green-500/20 bg-green-500/[0.06] p-8 transition hover:border-green-400/40"
          >
            <MessageSquare className="mb-5 h-7 w-7 text-green-400" />
            <h2 className="text-2xl font-bold">Run the visibility audit</h2>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              Best if you want a structured diagnosis before a strategy call.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
              Start audit
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="https://www.pantechsoft.com/ai-marketing-agency-kolkata"
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20"
          >
            <Mail className="mb-5 h-7 w-7 text-blue-400" />
            <h2 className="text-2xl font-bold">Reach the wider team</h2>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              RankUp AEO is connected to the PanTech Software growth ecosystem in Kolkata.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
              Open PanTech
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-bold font-space">Contact form</h2>
            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-gray-300">
                Name
                <input
                  name="name"
                  type="text"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-green-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-300">
                Work email
                <input
                  name="email"
                  type="email"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-green-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-300">
                Website
                <input
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-green-400"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-gray-300">
                What do you need help with?
                <textarea
                  name="message"
                  rows={5}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-green-400"
                />
              </label>
              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
              >
                Prepare inquiry
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl font-bold font-space">What to include</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-gray-300">
            <li>Your website URL and main service category.</li>
            <li>The search or AI visibility problem you are trying to solve.</li>
            <li>Any target locations, industries, or competitors that matter.</li>
            <li>Whether you need an audit, a report, or implementation help.</li>
          </ul>
          </div>
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
