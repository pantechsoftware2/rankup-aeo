'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';

// Mock data for competitors
const MOCK_COMPETITORS = [
  { name: 'Teladoc', score: 82, color: 'from-red-500 to-red-600' },
  { name: 'Amwell', score: 76, color: 'from-orange-500 to-orange-600' },
  { name: 'Doctor On Demand', score: 71, color: 'from-yellow-500 to-yellow-600' },
  { name: 'PlushCare', score: 68, color: 'from-green-500 to-green-600' },
  { name: 'MDLive', score: 64, color: 'from-blue-500 to-blue-600' },
];

const MOCK_CURRENT_SCORE = 55;
const MOCK_CONFIDENCE_RANK = 'Medium Confidence';

export default function CompetitorRankings() {
  return (
    <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white font-space mb-2">
          Competitive Landscape
        </h2>
        <p className="text-sm text-gray-400">
          See how you stack up against industry leaders
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* LEFT COLUMN: Current Score Circle */}
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-48 h-48 rounded-full border-8 border-gray-800 flex items-center justify-center relative">
              {/* Progress Ring */}
              <svg className="absolute inset-0 -rotate-90" width="192" height="192">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - MOCK_CURRENT_SCORE / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Score Display */}
              <div className="text-center z-10">
                <div className="text-6xl font-bold text-white font-space mb-1">
                  {MOCK_CURRENT_SCORE}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">
                  Your Score
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <Award className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
              {MOCK_CONFIDENCE_RANK}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Top 5 Competitors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white font-space">
              Top 5 Competitors
            </h3>
          </div>

          {MOCK_COMPETITORS.map((competitor, index) => (
            <motion.div
              key={competitor.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              {/* Competitor Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-300">
                    #{index + 1}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {competitor.name}
                  </span>
                </div>
                <span className="text-sm font-mono text-gray-400">
                  {competitor.score}/100
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${competitor.score}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full bg-gradient-to-r ${competitor.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strategic Analysis Section */}
      <div className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-white font-space mb-2">
              Strategic Analysis
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your brand is currently positioned in the <span className="text-yellow-400 font-bold">growth phase</span> of 
              the competitive landscape. To close the gap with market leaders like Teladoc and Amwell, focus on improving 
              your <span className="text-green-400 font-bold">visibility score</span> and <span className="text-green-400 font-bold">citation share</span>. 
              Strategic content optimization in high-value queries could yield a <span className="text-green-400 font-bold">15-20 point increase</span> within 
              3-6 months.
            </p>
          </div>
        </div>

        {/* Key Recommendations */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Increase content depth</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">Target featured snippets</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-300">Build authoritative citations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
