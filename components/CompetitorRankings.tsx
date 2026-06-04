'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FastScanResult } from '@/types/fast-scan';

interface CompetitorRankingsProps {
  fastScan?: FastScanResult | null;
  isLoading?: boolean;
}

// Color map for competitors based on position
const colorMap = [
  'from-red-500 to-red-600',
  'from-orange-500 to-orange-600',
  'from-yellow-500 to-yellow-600',
  'from-green-500 to-green-600',
  'from-blue-500 to-blue-600',
];

export default function CompetitorRankings({ fastScan, isLoading = false }: CompetitorRankingsProps) {
  const router = useRouter();

  // If no fast scan yet, show prompt
  if (!fastScan && !isLoading) {
    return (
      <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white font-space mb-2">
            Competitive Landscape
          </h2>
          <p className="text-sm text-gray-400">
            See how you stack up against industry leaders
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-12 flex flex-col items-center text-center gap-4"
        >
          <AlertCircle className="w-16 h-16 text-amber-400" />
          <div>
            <h3 className="text-xl font-bold text-white font-space mb-2">
              Competitor Analysis Pending
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Run a scan to see where you stand against competitors in your industry.
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                router.push('/');
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Scanning…' : 'Start New Audit'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate user's score from clarity score
  const userScore = fastScan?.clarity?.clarityScore || 50;
  
  // Get competitors list
  const competitors = fastScan?.competitors?.competitors || [];
  const usesPlaceholderCompetitors = competitors.some((competitor) => competitor.name.includes('#'));

  const competitorStatusMessage = isLoading
    ? 'Gathering competitor intelligence as part of fast scan...'
    : usesPlaceholderCompetitors
      ? 'Competitor results are placeholder values right now because external search visibility is not configured.'
      : competitors.length > 0
      ? null
      : 'No competitors detected in fast scan; trying fallback values.';

  return (
    <div className="w-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white font-space mb-2">
          Competitive Landscape
        </h2>
        <p className="text-sm text-gray-400">
          See how you stack up against industry leaders
        </p>
        {competitorStatusMessage && (
          <p className="text-xs text-amber-300 mt-2">{competitorStatusMessage}</p>
        )}
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
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - (isLoading ? 0 : userScore) / 100)}`}
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
                  {isLoading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    userScore
                  )}
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
              {fastScan?.classification?.confidence === 'high'
                ? 'High Confidence'
                : fastScan?.classification?.confidence === 'medium'
                ? 'Medium Confidence'
                : 'Low Confidence'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Top Competitors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white font-space">
              Top {Math.min(competitors.length, 5)} Competitors
            </h3>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-zinc-800/50 rounded-full animate-pulse" />
                  <div className="h-2 bg-zinc-800/50 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : competitors.length > 0 ? (
            competitors.slice(0, 5).map((competitor, index) => (
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
                    {Math.round(competitor.estimatedVisibility)}/100
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(competitor.estimatedVisibility, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${colorMap[index] || colorMap[colorMap.length - 1]}`}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No competitor data available</p>
          )}
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
              Competitive Position
            </h4>
            {isLoading ? (
              <p className="text-sm text-gray-400 animate-pulse">Analyzing competitive landscape...</p>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed">
                {competitors.length > 0 ? (
                  <>
                    Your estimated AEO visibility of <span className="text-green-400 font-bold">{userScore}/100</span> puts
                    you in the <span className="text-yellow-400 font-bold">
                      {userScore >= 75 ? 'market leader' : userScore >= 50 ? 'competitive' : 'growth'}
                    </span>{' '}
                    category against <span className="text-green-400 font-bold">{competitors.length} identified competitors</span>. 
                    Focus on the recommendations in your detailed audit to improve your position in AI-generated search results.
                  </>
                ) : (
                  'No competitors identified yet. Your market positioning will be revealed after a full audit.'
                )}
              </p>
            )}
          </div>
        </div>

        {/* Key Recommendations */}
        {!isLoading && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Improve content clarity</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Enhance structure markup</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Build authority signals</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
