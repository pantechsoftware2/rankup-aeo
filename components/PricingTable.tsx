'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Pricing plans data
const PRICING_PLANS = [
  {
    id: 'lite',
    name: 'Lite',
    price: 29,
    description: 'Perfect for solopreneurs and small businesses getting started',
    popular: false,
    features: [
      '5 keyword analyses per month',
      'Basic visibility score',
      'Sentiment analysis',
      'Email support',
      'Monthly reports',
    ],
    ctaText: 'Start Free Trial',
    gradient: 'from-gray-500 to-gray-600',
    borderColor: 'border-white/10',
    bgGlow: 'rgba(255, 255, 255, 0.05)',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 119,
    description: 'Ideal for growing businesses serious about AEO',
    popular: true,
    features: [
      '25 keyword analyses per month',
      'Advanced visibility & sentiment',
      'Citation share tracking',
      'Competitor benchmarking (top 5)',
      'Priority email support',
      'Weekly reports',
      'API access',
    ],
    ctaText: 'Start Free Trial',
    gradient: 'from-green-500 to-green-600',
    borderColor: 'border-green-500/30',
    bgGlow: 'rgba(34, 197, 94, 0.15)',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 189,
    description: 'For enterprises requiring comprehensive AEO insights',
    popular: false,
    features: [
      'Unlimited keyword analyses',
      'Full AEO content score',
      'Deep competitor analysis (top 20)',
      'Strategic recommendations',
      'Custom integrations',
      'Dedicated account manager',
      'Daily reports & alerts',
      'White-label options',
    ],
    ctaText: 'Start Free Trial',
    gradient: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500/30',
    bgGlow: 'rgba(59, 130, 246, 0.15)',
  },
];

interface PricingTableProps {
  onPlanSelect?: (planId: string) => void;
}

export default function PricingTable({ onPlanSelect }: PricingTableProps) {
  const router = useRouter();

  const handleTrialClick = (planId: string) => {
    // If callback is provided (used in AuditConversionFlow), use it
    if (onPlanSelect) {
      onPlanSelect(planId);
    } else {
      // Otherwise, use router navigation (standalone usage)
      router.push(`/onboarding?plan=${planId}`);
    }
  };

  return (
    <div className="w-full py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block mb-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
              Simple, Transparent Pricing
            </span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white font-space mb-4"
        >
          Choose Your AEO Plan
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Start with a 14-day free trial. No credit card required. Cancel anytime.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-[#0A0A0A] border ${plan.borderColor} rounded-3xl p-8 flex flex-col ${
              plan.popular ? 'md:scale-105 md:shadow-[0_0_60px_' + plan.bgGlow + ']' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                  <Zap className="w-3 h-3 text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              </div>
            )}

            {/* Plan Name */}
            <h3 className="text-2xl font-bold text-white font-space mb-2">
              {plan.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-6">
              {plan.description}
            </p>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-white font-space">
                  ${plan.price}
                </span>
                <span className="text-gray-400 text-sm mb-2 font-mono">
                  /month
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Billed monthly • Cancel anytime
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleTrialClick(plan.id)}
              className={`w-full px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                plan.popular
                  ? `bg-gradient-to-r ${plan.gradient} hover:scale-105 text-white shadow-[0_0_30px_${plan.bgGlow}]`
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              {plan.ctaText}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <p className="text-sm text-gray-500">
          Need a custom enterprise plan? <a href="#" className="text-green-400 hover:text-green-300 underline">Contact our sales team</a>
        </p>
      </motion.div>
    </div>
  );
}
