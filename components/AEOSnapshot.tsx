'use client';

import { motion } from 'framer-motion';
import { Eye, Heart, Quote, FileText, Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { DeepAuditReport } from '@/types/deep-audit';

interface AEOSnapshotProps {
  deepAudit?: DeepAuditReport | null;
  isLoading?: boolean;
}

export default function AEOSnapshot({ deepAudit, isLoading = false }: AEOSnapshotProps) {
  const router = useRouter();

  // If no deep audit yet, show prompt to run scan
  if (!deepAudit && !isLoading) {
    return (
      <div className="w-full">
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

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-12 flex flex-col items-center text-center gap-4"
        >
          <AlertCircle className="w-16 h-16 text-amber-400" />
          <div>
            <h3 className="text-xl font-bold text-white font-space mb-2">
              No Audit Data Yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Run a comprehensive audit first to see your AEO snapshot, dimension scores, and executive summary.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105"
            >
              Start New Audit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

 
  const topDimensions = deepAudit
    ? [
        { name: 'Content-Market Fit', score: deepAudit.dimensions.contentMarketFit?.score || 0 },
        { name: 'Credibility', score: deepAudit.dimensions.credibility?.score || 0 },
        { name: 'Conversion Architecture', score: deepAudit.dimensions.conversionArchitecture?.score || 0 },
        { name: 'Technical SEO', score: deepAudit.dimensions.technicalSEO?.score || 0 },
        { name: 'GEO Readiness', score: deepAudit.dimensions.geoReadiness?.score || 0 },
        { name: 'Competitive Position', score: deepAudit.dimensions.competitivePosition?.score || 0 },
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  const overallScore = deepAudit?.overallScore || 0;
  const executiveSummary = deepAudit?.executiveSummary || 'Awaiting analysis...';

  const metrics = [
    {
      id: 1,
      icon: Eye,
      label: 'Overall Score',
      value: `${overallScore}/100`,
      description: deepAudit
        ? `Your website has an overall AEO score of ${overallScore}. This reflects your optimization across all dimensions.`
        : 'Awaiting analysis...',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      id: 2,
      icon: Heart,
      label: topDimensions[0]?.name || 'Dimension 1',
      value: `${topDimensions[0]?.score || 0}/100`,
      description: topDimensions[0]
        ? `Your strongest dimension. This area shows good alignment with AEO best practices.`
        : 'Awaiting analysis...',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    {
      id: 3,
      icon: Quote,
      label: topDimensions[1]?.name || 'Dimension 2',
      value: `${topDimensions[1]?.score || 0}/100`,
      description: topDimensions[1]
        ? `Another key strength in your AEO strategy.`
        : 'Awaiting analysis...',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      id: 4,
      icon: FileText,
      label: topDimensions[2]?.name || 'Dimension 3',
      value: `${topDimensions[2]?.score || 0}/100`,
      description: topDimensions[2]
        ? `This dimension contributes to your overall performance.`
        : 'Awaiting analysis...',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-400',
    },
  ];

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

      {/* Executive Summary */}
      {deepAudit && executiveSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 mb-8 border ${
            executiveSummary.toLowerCase().includes('broken') || 
            executiveSummary.toLowerCase().includes('critical') ||
            executiveSummary.toLowerCase().includes('failure')
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-gradient-to-br from-blue-500/5 to-green-500/5 border-blue-500/20'
          }`}
        >
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-lg ${
              executiveSummary.toLowerCase().includes('broken') || 
              executiveSummary.toLowerCase().includes('critical') ||
              executiveSummary.toLowerCase().includes('failure')
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {executiveSummary.toLowerCase().includes('broken') || 
              executiveSummary.toLowerCase().includes('critical') ||
              executiveSummary.toLowerCase().includes('failure')
                ? '⚠️'
                : 'ℹ️'}
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${
                executiveSummary.toLowerCase().includes('broken') || 
                executiveSummary.toLowerCase().includes('critical') ||
                executiveSummary.toLowerCase().includes('failure')
                  ? 'text-red-400'
                  : 'text-blue-400'
              }`}>
                {executiveSummary.toLowerCase().includes('broken') || 
                executiveSummary.toLowerCase().includes('critical') ||
                executiveSummary.toLowerCase().includes('failure')
                  ? 'Critical Issues Found'
                  : 'Executive Summary'}
              </h3>
              <p className="text-sm text-gray-100 leading-relaxed">
                {isLoading ? (
                  <span className="animate-pulse">Loading summary...</span>
                ) : (
                  executiveSummary
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group shadow-lg"
          >
            {/* Icon */}
            <div className={`${metric.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
            </div>

            {/* Label */}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">
              {metric.label}
            </h3>

            {/* Value */}
            <div className={`text-3xl font-bold mb-4 font-space bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
              {isLoading ? (
                <span className="animate-pulse">--</span>
              ) : (
                metric.value
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed">
              {metric.description}
            </p>

            {/* Progress Indicator (decorative) */}
            {deepAudit && metric.id <= 3 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${parseFloat(metric.value)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${metric.color}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {isLoading ? '--' : metric.value}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      {deepAudit && (
        <div className="mt-8 bg-gradient-to-r from-green-500/15 to-blue-500/15 border border-green-500/30 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-space mb-1">
                Want to Fix These Issues?
              </h3>
              <p className="text-sm text-gray-300">
                Get detailed recommendations and implementation guidance with our premium plans.
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:scale-105 whitespace-nowrap">
              View Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

