'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import OnboardingIntake from '@/components/OnboardingIntake';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const plan = searchParams.get('plan');
    setSelectedPlan(plan);
  }, [searchParams]);

  const planNames: { [key: string]: string } = {
    lite: 'Lite',
    standard: 'Standard',
    growth: 'Growth',
  };

  const planPrices: { [key: string]: number } = {
    lite: 29,
    standard: 119,
    growth: 189,
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      {/* Navigation Bar */}
      <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link 
          href="/report-preview"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Back to Report
        </Link>
        
        {selectedPlan && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
              {planNames[selectedPlan]} Plan Selected
            </span>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Plan Summary Card (if plan selected) */}
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
                    Welcome to {planNames[selectedPlan]}! 🎉
                  </h3>
                  <p className="text-sm text-gray-300">
                    You're starting your 14-day free trial at <span className="font-bold text-green-400">${planPrices[selectedPlan]}/month</span>
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
        <OnboardingIntake />

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
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
