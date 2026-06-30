'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useScanContext } from '@/lib/scan-context';
import CompetitorRankings from './CompetitorRankings';
import AEOSnapshot from './AEOSnapshot';
import OnboardingIntake, { type OnboardingIntakePayload } from './OnboardingIntake';
import { getContactConfig } from '@/lib/contact';

const RETAINER_PLAN = {
  id: 'retainer',
  name: '90-Day Retainer',
  price: 7500,
};

export default function AuditConversionFlow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contact = getContactConfig();

  // Read from scan context to get real audit data
  const { url, stage, crawl, fast, deep } = useScanContext();

  // Handle onboarding form submission
  const handleOnboardingSubmit = async (intake: OnboardingIntakePayload) => {
    if (intake.keywords.length === 0) {
      alert('Please enter at least one keyword or prompt.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: intake.name,
      email: intake.email,
      phone: intake.phone,
      company: intake.company,
      source: 'audit_conversion_flow',
      plan: RETAINER_PLAN.id,
      planName: RETAINER_PLAN.name,
      planPrice: RETAINER_PLAN.price,
      keywords: intake.keywords,
      submittedAt: new Date().toISOString(),
      // Include scan context if available
      scanUrl: url || undefined,
      scanMetrics: {
        overallScore: deep?.overallScore || 0,
        crawlUrl: crawl?.meta?.canonical,

        industry: fast?.classification?.industry,
        niche: fast?.classification?.niche,
        clarityScore: fast?.clarity?.clarityScore,
        technicalScore: fast?.technical?.technicalScore,
        competitorCount: fast?.competitors?.competitors?.length || 0,
      },
    };

    console.log('📊 Project Intake Payload:', payload);

    try {
      // TODO: Replace with actual database save when DB is configured
      // For now, send to API route that will handle storage
      const response = await fetch('/api/project-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save project intake');
      }

      const result = await response.json();
      console.log('✅ Saved successfully:', result);

      // Show success state
      setShowSuccess(true);
      
      // Optional: Reset after a delay or redirect
      setTimeout(() => {
        // Could redirect to dashboard or keep them here
        console.log('Flow completed successfully');
      }, 2000);

    } catch (error) {
      console.error('❌ Error saving project intake:', error);
      alert('There was an error saving your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-500"></div>

      {/* Main Content */}
      <div className="relative z-10">
        
        <AnimatePresence mode="wait">
          <motion.div
            key="report-teaser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
              {/* Navigation Bar */}
              <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </button>
                
                <div className="text-xs text-gray-500 font-mono">
                  PREVIEW MODE
                </div>
              </nav>

              <div className="max-w-7xl mx-auto px-6 pb-20">
                
                {/* Page Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-16 mt-8"
                >
                  <div className="inline-block mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                      <span className="text-xl">🎯</span>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                        Your AEO Report Preview
                      </span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white font-space mb-4">
                    See the highest-leverage gaps first
                  </h1>
                  
                  <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    This teaser shows the obvious leaks. The custom report lands in your inbox after review, and the paid strategy call walks through the rollout.
                  </p>
                </motion.div>

                {/* AEO Snapshot Section */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-16"
                >
                  <AEOSnapshot deepAudit={deep} isLoading={stage === 'deep-scanning'} />
                </motion.section>

                {/* Competitor Rankings Section */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-16"
                >
                  <CompetitorRankings fastScan={fast} isLoading={stage === 'fast-scanning'} />
                </motion.section>

                {/* Divider with CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-16"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-[#050505] px-6 py-3 border border-green-500/30 rounded-full">
                        <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
                          ↓ Unlock Full Analysis Below ↓
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Retainer Intake Section */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-16"
                >
                  <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/15 border border-green-500/30 rounded-2xl p-6 shadow-lg">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white font-space mb-1">
                            Request the 90-Day Retainer plan
                          </h3>
                          <p className="text-sm text-gray-200">
                            Retainers start at <span className="font-bold text-green-400">$7,500/month</span>. We&apos;ll use this intake to prep your custom report and rollout recommendation.
                          </p>
                        </div>
                        <div className="text-xs text-gray-300 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                          Custom report emailed first, paid call after
                        </div>
                      </div>
                    </div>
                  </div>

                  <OnboardingIntake
                    onSubmit={handleOnboardingSubmit}
                    isSubmitting={isSubmitting}
                    headingAs="h2"
                  />
                </motion.section>

                {/* Footer Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-16 pb-8"
                >
                  <div className="inline-block bg-white/10 border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all">
                    <p className="text-sm text-gray-300 mb-2">
                      🔒 <span className="font-bold text-white">Full Deep-Dive Report</span> includes:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                      <span>• Detailed competitor analysis</span>
                      <span>• Content gap identification</span>
                      <span>• Strategic roadmap</span>
                      <span>• Citation opportunities</span>
                    </div>
                  </div>
                </motion.div>

              </div>
              {/* Success Message */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-4xl mx-auto mt-8 mb-8 px-6"
                >
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/15 border border-green-500/40 rounded-2xl p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-space mb-2">
                      You&apos;re All Set! 🚀
                    </h3>
                    <p className="text-gray-200 mb-4">
                      We&apos;ve received your targets and contact details. Expect the custom report in your inbox, followed by the paid strategy call.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <a
                        href={contact.primaryHref}
                        target={contact.openInNewTab ? '_blank' : undefined}
                        rel={contact.openInNewTab ? 'noreferrer' : undefined}
                        className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200"
                      >
                        {contact.primaryLabel}
                      </a>
                      <a
                        href={contact.secondaryHref}
                        className="inline-flex items-center justify-center rounded-xl bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                      >
                        Email Us
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="max-w-4xl mx-auto mt-12 px-6 pb-12"
              >
                <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Human review before report send
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Custom PDF delivered by email
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Prompt prioritization included
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Paid strategy call available
                  </div>
                </div>
              </motion.div>
          </motion.div>

        </AnimatePresence>

      </div>
    </div>
  );
}
