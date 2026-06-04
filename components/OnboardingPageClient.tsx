'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import OnboardingIntake, { type OnboardingIntakePayload } from '@/components/OnboardingIntake';
import { getContactConfig } from '@/lib/contact';

const RETAINER_PLAN = {
  id: 'retainer',
  name: '90-Day Retainer',
  price: 7500,
};

function OnboardingContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contact = getContactConfig();

  const handleSubmit = async (payload: OnboardingIntakePayload) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/project-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source: 'onboarding_page',
          plan: RETAINER_PLAN.id,
          planName: RETAINER_PLAN.name,
          planPrice: RETAINER_PLAN.price,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || 'Failed to submit intake');
      }

      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Onboarding submission failed:', error);
      alert(error instanceof Error ? error.message : 'There was an error sending your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link
          href="/report-preview"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Back to Report
        </Link>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white font-space mb-1">
                  90-Day Retainer Strategy Intake
                </h3>
                <p className="text-sm text-gray-300">
                  Retainers start at <span className="font-bold text-green-400">$7,500/month</span> and we use this intake to prioritize the prompts that matter first.
                </p>
              </div>
              <div className="text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                We email the custom report first, then you can book the paid call
              </div>
            </div>
          </div>
        </motion.div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Request received</h2>
              <p className="text-sm text-gray-300">
                We&apos;ll send the custom report to your inbox and you can book the paid strategy call once it&apos;s ready.
              </p>
              <div className="mt-5 flex justify-center">
                <a
                  href={contact.primaryHref}
                  target={contact.openInNewTab ? '_blank' : undefined}
                  rel={contact.openInNewTab ? 'noreferrer' : undefined}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200"
                >
                  {contact.primaryLabel}
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <OnboardingIntake onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Manual review before report send
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Custom PDF delivered by email
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Highest-leverage prompts prioritized
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Paid strategy call available
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OnboardingPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
