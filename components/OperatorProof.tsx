'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OperatorProof() {
  return (
    <section
      aria-labelledby="operator-proof-heading"
      className="py-32 px-6 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl mb-16">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-mono text-green-400 uppercase tracking-widest">
              OPERATOR PROOF
            </span>
          </div>

          <h2
            id="operator-proof-heading"
            className="text-3xl md:text-5xl font-bold text-white mb-6 font-space"
          >
            We don&apos;t just consult on SEO and AEO. We build and rank our own B2B SaaS products.
          </h2>

          <p className="text-lg text-gray-400 leading-relaxed">
            Most agencies sell a playbook they&apos;ve never run on their own money. We do. Vizly is a
            B2B SaaS product we built and operate ourselves — and it&apos;s where we test the same SEO
            and AEO system we run for clients. When we recommend a tactic for your retainer, it is
            because we have already paid for the lessons on our own product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-8">
            <div className="text-2xl font-bold text-white mb-4 font-space">
              Vizly — built by us, ranked by us
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Vizly is a creative systems product for B2B and consumer brands. It lives in a
              competitive category alongside design and content tooling that has far bigger budgets
              than us. The only way it gets discovered is if the SEO and AEO foundation is sharper
              than the incumbents&apos;. That&apos;s the bar we hold ourselves to.
            </p>
            <a
              href="https://tryvizly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
            >
              See Vizly
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-8">
            <div className="text-2xl font-bold text-white mb-6 font-space">
              What running our own product teaches us
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-green-400" />
                <span>We feel category competition the way our clients do, every week.</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-green-400" />
                <span>
                  We know which AEO tactics actually move citations, because we test them on Vizly
                  first.
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-green-400" />
                <span>
                  We see what GSC, GA4, and AI Overview behavior look like for a real product, not
                  a hypothetical.
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-green-400" />
                <span>We have skin in the game. The playbook has to work, or we don&apos;t eat.</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Vizly is operated by the same team behind RankUpAEO and PanTech Software. Transparency
          note: it is our own product, not a third-party client case study.
        </p>
      </div>
    </section>
  );
}
