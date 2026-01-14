'use client';

import { motion } from 'framer-motion';
import { Eye, Heart, Quote, FileText, Lock } from 'lucide-react';

// Mock data for the metrics
const MOCK_METRICS = [
  {
    id: 1,
    icon: Eye,
    label: 'Visibility Score',
    value: '7.4%',
    description: 'Maintenance is vital for sustained AEO performance. Your brand appears in 7.4% of relevant AI responses.',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    id: 2,
    icon: Heart,
    label: 'Positive Sentiment',
    value: '45%',
    description: 'Sentiment is positive 45% of the time when your brand is mentioned in AI-generated responses.',
    color: 'from-green-500 to-green-600',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
  },
  {
    id: 3,
    icon: Quote,
    label: 'Citation Share',
    value: '4.3%',
    description: 'Your brand is cited in 4.3% of AI responses across the competitive landscape.',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
  {
    id: 4,
    icon: FileText,
    label: 'AEO Content Score',
    value: 'N/A',
    description: 'Upgrade to access comprehensive content optimization scores and actionable recommendations.',
    color: 'from-gray-500 to-gray-600',
    iconBg: 'bg-gray-500/10',
    iconColor: 'text-gray-400',
    locked: true,
  },
];

export default function AEOSnapshot() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-space">
            AEO Snapshot
          </h2>
        </div>
        <p className="text-sm text-gray-400 ml-[52px]">
          Get a quick overview of your AI Engine Optimization performance across key pillars
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_METRICS.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
          >
            {/* Locked Overlay */}
            {metric.locked && (
              <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Premium Feature
                  </span>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className={`${metric.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
            </div>

            {/* Label */}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">
              {metric.label}
            </h3>

            {/* Value */}
            <div className={`text-4xl font-bold mb-4 font-space bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
              {metric.value}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed">
              {metric.description}
            </p>

            {/* Progress Indicator (decorative) */}
            {!metric.locked && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${metric.color}`}
                      style={{ width: metric.value }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {metric.value !== 'N/A' ? metric.value : '--'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-8 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-space mb-1">
              Want the Complete Picture?
            </h3>
            <p className="text-sm text-gray-300">
              Unlock detailed analytics, competitor insights, and actionable recommendations with our premium plans.
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105 whitespace-nowrap">
            View Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
