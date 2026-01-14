'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import CompetitorRankings from './CompetitorRankings';
import AEOSnapshot from './AEOSnapshot';
import PricingTable from './PricingTable';
import OnboardingIntake from './OnboardingIntake';

type FlowStep = 'REPORT_TEASER' | 'ONBOARDING';

interface SelectedPlanInfo {
  id: string;
  name: string;
  price: number;
}

export default function AuditConversionFlow() {
  const [step, setStep] = useState<FlowStep>('REPORT_TEASER');
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlanInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Plan metadata
  const planMetadata: { [key: string]: { name: string; price: number } } = {
    lite: { name: 'Lite', price: 29 },
    standard: { name: 'Standard', price: 119 },
    growth: { name: 'Growth', price: 189 },
  };

  // Handle plan selection from PricingTable
  const handlePlanSelection = (planId: string) => {
    const plan = planMetadata[planId];
    if (plan) {
      setSelectedPlan({
        id: planId,
        name: plan.name,
        price: plan.price,
      });
      setStep('ONBOARDING');
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle onboarding form submission
  const handleOnboardingSubmit = async (keywords: string[]) => {
    if (!selectedPlan) {
      console.error('No plan selected');
      return;
    }

    if (keywords.length === 0) {
      alert('Please enter at least one keyword or prompt.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      plan: selectedPlan.id,
      planName: selectedPlan.name,
      planPrice: selectedPlan.price,
      keywords: keywords,
      submittedAt: new Date().toISOString(),
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

  // Go back to report view
  const handleBack = () => {
    setStep('REPORT_TEASER');
    setSelectedPlan(null);
    setShowSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="relative z-10">
        
        <AnimatePresence mode="wait">
          
          {/* STEP 1: REPORT TEASER + PRICING */}
          {step === 'REPORT_TEASER' && (
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
                    See How You Stack Up
                  </h1>
                  
                  <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Here's a snapshot of your AI Engine Optimization performance. Scroll down to unlock the complete deep-dive analysis.
                  </p>
                </motion.div>

                {/* AEO Snapshot Section */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-16"
                >
                  <AEOSnapshot />
                </motion.section>

                {/* Competitor Rankings Section */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-16"
                >
                  <CompetitorRankings />
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

                {/* Pricing Section */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  id="pricing"
                >
                  <PricingTable onPlanSelect={handlePlanSelection} />
                </motion.section>

                {/* Footer Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-16 pb-8"
                >
                  <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                    <p className="text-sm text-gray-400 mb-2">
                      🔒 <span className="font-bold text-white">Full Deep-Dive Report</span> includes:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                      <span>• Detailed competitor analysis</span>
                      <span>• Content gap identification</span>
                      <span>• Strategic roadmap</span>
                      <span>• Citation opportunities</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}

          {/* STEP 2: ONBOARDING */}
          {step === 'ONBOARDING' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              {/* Navigation Bar */}
              <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  Back to Report
                </button>
                
                {selectedPlan && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                      {selectedPlan.name} Plan Selected
                    </span>
                  </div>
                )}
              </nav>

              <div className="max-w-7xl mx-auto px-6 py-12">
                
                {/* Plan Summary Card */}
                {selectedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mb-8"
                  >
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white font-space mb-1">
                            Welcome to {selectedPlan.name}! 🎉
                          </h3>
                          <p className="text-sm text-gray-300">
                            You're starting your 14-day free trial at <span className="font-bold text-green-400">${selectedPlan.price}/month</span>
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                          No charge for 14 days • Cancel anytime
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Onboarding Form */}
                <OnboardingIntake 
                  onSubmit={handleOnboardingSubmit}
                  isSubmitting={isSubmitting}
                />

                {/* Success Message */}
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto mt-8"
                  >
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white font-space mb-2">
                        You're All Set! 🚀
                      </h3>
                      <p className="text-gray-300 mb-4">
                        We've received your optimization targets and will begin analysis within 24 hours.
                      </p>
                      <p className="text-sm text-gray-400">
                        Check your email for next steps and dashboard access.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-4xl mx-auto mt-12"
                >
                  <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      SOC 2 Certified
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      GDPR Compliant
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      256-bit Encryption
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Money-back Guarantee
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
