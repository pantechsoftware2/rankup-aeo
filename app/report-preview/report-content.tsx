'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Download, AlertTriangle, Loader, ChevronDown, ChevronUp, Zap, Target, Lightbulb, Check, X, LockKeyhole, PhoneCall, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScanContext, type ScanStage } from '@/lib/scan-context';
import type { PriorityAction } from '@/types/deep-audit';
import { exportAuditToPDF, shareAudit, normalizeUrl } from '@/lib/export-pdf';
import { getContactConfig } from '@/lib/contact';

// --- UI COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? Check : X;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg z-50`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

const CircleGauge = ({ score, size = 120 }: { score: number; size?: number }) => {
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';
  
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="#27272a"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold text-white">{score}</div>
        <div className="text-[10px] text-zinc-500">/ 100</div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="space-y-3">
    <div className="h-4 bg-zinc-800/50 rounded-full w-3/4 animate-pulse" />
    <div className="h-4 bg-zinc-800/50 rounded-full w-1/2 animate-pulse" />
    <div className="h-4 bg-zinc-800/50 rounded-full w-2/3 animate-pulse" />
  </div>
);

const stageLabels: Record<ScanStage, string> = {
  idle: 'Awaiting scan',
  crawling: 'Crawling website...',
  'fast-scanning': 'Fast analysis',
  'deep-scanning': 'Deep audit',
  complete: 'Complete',
  error: 'Error',
};

const stageSequence: ScanStage[] = ['crawling', 'fast-scanning', 'deep-scanning', 'complete'];

const StageStepper = ({ stage }: { stage: ScanStage }) => {
  const current = stageSequence.indexOf(stage);

  return (
    <div className="rounded-2xl bg-[#0B0B0D] border border-white/10 p-4 mb-6">
      <div className="text-xs text-zinc-400 uppercase tracking-widest mb-3">Real-time progress</div>
      <div className="grid grid-cols-4 gap-2">
        {stageSequence.map((s, idx) => {
          const isDone = stage === 'complete' ? true : idx < current;
          const isActive = stage !== 'complete' && idx === current;
          const isError = stage === 'error';

          const classes = isDone
            ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
            : isActive
            ? 'bg-green-600 border-green-400 text-white'
            : isError
            ? 'bg-red-500/20 border-red-400 text-red-300'
            : 'bg-[#131313] border-white/10 text-zinc-500';

          return (
            <motion.div key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg px-2 py-2 text-[11px] text-center font-semibold border ${classes}`}>
              <div className="flex items-center justify-center gap-1">
                {isDone ? <Check size={12} className="text-emerald-300" /> : isActive ? <Loader size={12} className="animate-spin" /> : null}
                <span>{stageLabels[s]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ImpactBadge = ({ impact }: { impact: 'high' | 'medium' | 'low' }) => {
  const styles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[impact]}`}>
      {impact === 'high' ? '🔴 High' : impact === 'medium' ? '🟡 Medium' : '🔵 Low'}
    </span>
  );
};

const EffortBadge = ({ effort }: { effort: 'quick-win' | 'moderate' | 'significant' }) => {
  const styles = {
    'quick-win': 'bg-green-500/20 text-green-400 border-green-500/30',
    'moderate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'significant': 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  const label = { 'quick-win': '⚡ Quick Win', 'moderate': '⏱ Moderate', 'significant': '🔧 Significant' };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[effort]}`}>
      {label[effort]}
    </span>
  );
};

const CategoryTag = ({ category }: { category: string }) => {
  const colors: any = {
    content: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    technical: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    geo: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    conversion: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    credibility: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded text-[9px] font-semibold uppercase border ${colors[category] || colors.content}`}>
      {category}
    </span>
  );
};

interface DimensionData {
  name: string;
  key: string;
  score: number;
  verdict: string;
  findings: string[];
}

interface DeepReportLeadFormState {
  name: string;
  email: string;
  phone: string;
  company: string;
}

const emptyLeadForm = (): DeepReportLeadFormState => ({
  name: '',
  email: '',
  phone: '',
  company: '',
});

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isLikelyValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 7;

const buildSurfaceLevelActions = (actions: PriorityAction[] | undefined, fast: ReturnType<typeof useScanContext>['fast']) => {
  if (actions?.length) {
    return actions.slice(0, 3);
  }

  const fallback: PriorityAction[] = [];

  if (fast?.clarity?.critique) {
    fallback.push({
      title: 'Clarify the homepage promise',
      description: fast.clarity.critique,
      impact: 'high',
      effort: 'quick-win',
      category: 'content',
    });
  }

  if (fast?.technical?.deductions?.[0]) {
    fallback.push({
      title: 'Resolve the biggest technical drag',
      description: fast.technical.deductions[0].reason,
      impact: 'medium',
      effort: 'moderate',
      category: 'technical',
    });
  }

  if (fast?.presence?.summary) {
    fallback.push({
      title: 'Strengthen off-site trust signals',
      description: fast.presence.summary,
      impact: 'high',
      effort: 'moderate',
      category: 'credibility',
    });
  }

  return fallback.slice(0, 3);
};

const DeepReportGate = ({
  form,
  error,
  isSubmitting,
  website,
  onChange,
  onSubmit,
  primaryHref,
  primaryLabel,
  openInNewTab,
}: {
  form: DeepReportLeadFormState;
  error: string;
  isSubmitting: boolean;
  website: string;
  onChange: (field: keyof DeepReportLeadFormState, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  primaryHref: string;
  primaryLabel: string;
  openInNewTab: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white/5 via-[#0A0A0A] to-green-500/10 border border-green-500/20 rounded-3xl p-8 md:p-10"
  >
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-xs font-bold uppercase tracking-wider text-green-300 mb-5">
          <LockKeyhole size={14} />
          Deep Report Request
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Request the full custom PDF.
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">
          Drop your work email and phone number and we&apos;ll queue the consultant-style report for <span className="text-white font-semibold">{website}</span>.
          You&apos;ll still get the first actions on this page, but the polished PDF, rollout order, and implementation plan are reviewed manually and sent to your inbox.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-green-300 mb-2">What you unlock</div>
            <div className="space-y-2 text-sm text-zinc-300">
              <div>3-5 surface-level fixes with plain-English explanations</div>
              <div>A polished PDF after review</div>
              <div>A follow-up email your team can forward internally</div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-amber-300 mb-2">Held for the call</div>
            <div className="space-y-2 text-sm text-zinc-300">
              <div>Implementation sequence and owner-level rollout plan</div>
              <div>Prompt strategy, page targets, and content brief direction</div>
              <div>Where we believe your fastest ROI will actually come from</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-zinc-400" />
            Work email required
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall size={14} className="text-zinc-400" />
            Phone used for handoff only
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-black/25 p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold text-white mb-1">Request the custom deep report</div>
          <div className="text-xs text-zinc-500">
            Best for teams that want the findings in writing first and then a paid strategy call to decide what gets fixed first.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-green-500/40 focus:outline-none"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="Work email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-green-500/40 focus:outline-none"
            required
          />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-green-500/40 focus:outline-none"
            required
          />
          <input
            type="text"
            value={form.company}
            onChange={(e) => onChange('company', e.target.value)}
            placeholder="Company"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-green-500/40 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Requesting report...' : 'Email Me The Custom PDF'}
        </button>

        <a
          href={primaryHref}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noreferrer' : undefined}
          className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
        >
          {primaryLabel}
        </a>
      </form>
    </div>
  </motion.div>
);

const DimensionCard = ({ dimension, isLoading }: { dimension: DimensionData; isLoading: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = dimension.score >= 70 ? 'text-green-400' : dimension.score >= 40 ? 'text-amber-400' : 'text-red-400';
  const borderColor = dimension.score >= 70 ? 'border-green-500/20' : dimension.score >= 40 ? 'border-amber-500/20' : 'border-red-500/20';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0A0A0A] border ${borderColor} rounded-2xl p-6 transition-all hover:border-white/10`}
    >
      {isLoading ? (
       <>
          <div className="h-5 bg-zinc-800/50 rounded w-1/2 mb-4 animate-pulse" />
          <SkeletonLoader />
        </>
      ) : (
        <>
          <h3 className="text-sm font-bold text-white mb-4">{dimension.name}</h3>
          <div className="flex items-center gap-4 mb-4">
            <CircleGauge score={dimension.score} size={88} />
            <div className="flex-1">
              <p className={`text-xs text-zinc-400 leading-relaxed`}>{dimension.verdict}</p>
            </div>
          </div>
          
          {/* Findings */}
          {dimension.findings.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-300 transition-colors mb-2"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Findings ({dimension.findings.length})
              </button>
              
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 mt-2 pt-2 border-t border-white/5"
                >
                  {dimension.findings.map((finding, i) => (
                    <div key={i} className="text-xs text-zinc-400 flex gap-2">
                      <span className="text-zinc-600 shrink-0">•</span>
                      <span>{finding}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default function ReportContent() {
  const searchParams = useSearchParams();
  const { url, stage, crawl, fast, deep, error } = useScanContext();
  const contact = getContactConfig();
  const [displayUrl, setDisplayUrl] = useState('');
  const [scanStartTime, setScanStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState('0s');
  const [expandedTechnical, setExpandedTechnical] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [leadForm, setLeadForm] = useState<DeepReportLeadFormState>(emptyLeadForm);
  const [leadError, setLeadError] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [reportJobId, setReportJobId] = useState('');
  const [isCapturingLead, setIsCapturingLead] = useState(false);

  // Get URL from query params or context
  useEffect(() => {
    const paramUrl = searchParams.get('url');
    if (paramUrl) {
      setDisplayUrl(decodeURIComponent(paramUrl));
    } else if (url) {
      setDisplayUrl(url);
    }
  }, [url, searchParams]);

  useEffect(() => {
    if (!displayUrl || typeof window === 'undefined') {
      return;
    }

    try {
      const storageKey = `deep-report:${normalizeUrl(displayUrl)}`;
      const storedJobId = window.sessionStorage.getItem(storageKey);
      setLeadCaptured(Boolean(storedJobId));
      setReportJobId(storedJobId || '');
    } catch {
      setLeadCaptured(false);
      setReportJobId('');
    }
  }, [displayUrl]);

  // Track elapsed time
  useEffect(() => {
    if (stage === 'crawling' && scanStartTime === 0) {
      setScanStartTime(Date.now());
    }
    
    if (scanStartTime > 0 && stage !== 'complete' && stage !== 'error') {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - scanStartTime) / 1000);
        setElapsedTime(elapsed > 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`);
      }, 100);
      return () => clearInterval(interval);
    } else if (stage === 'complete' || stage === 'error') {
      const elapsed = Math.floor((Date.now() - scanStartTime) / 1000);
      setElapsedTime(elapsed > 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`);
    }
  }, [stage, scanStartTime]);

  // Handle Share button click
  const handleShare = async () => {
    if (!displayUrl) return;
    if (deepPreviewReady) {
      setToast({ message: 'We send the polished PDF by email after review. Share the final PDF from your inbox.', type: 'error' });
      return;
    }
    setIsSharing(true);
    try {
      const success = await shareAudit(displayUrl);
      if (success) {
        setToast({ message: 'Share link copied to clipboard!', type: 'success' });
      } else {
        setToast({ message: 'Failed to share. Please try again.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Share failed. Please try again.', type: 'error' });
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Export to PDF button click
  const handleExportPDF = async () => {
    if (!displayUrl) {
      setToast({ message: 'URL not found. Please run a new audit.', type: 'error' });
      return;
    }

    if (deepPreviewReady) {
      setToast({ message: 'The consultant-style PDF is delivered by email after review.', type: 'error' });
      return;
    }

    setIsExporting(true);
    try {
      // Normalize the URL to include protocol if missing
      const normalizedUrl = normalizeUrl(displayUrl);
      
      // Extract hostname safely
      const urlObj = new URL(normalizedUrl);
      const hostname = urlObj.hostname || 'unknown';
      
      const fileName = `audit-${hostname}-${new Date().toISOString().split('T')[0]}.pdf`;
      await exportAuditToPDF(normalizedUrl, fileName);
      setToast({ message: 'Audit exported to PDF successfully!', type: 'success' });
    } catch (err) {
      console.error('Export failed:', err);
      setToast({ message: 'Failed to export PDF. Please try again.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // Loading states for each stage
  const isLoading = stage !== 'complete' && stage !== 'error';
  const isCrawling = stage === 'crawling';
  const isFast = stage === 'fast-scanning' || stage === 'deep-scanning';
  const isDeep = stage === 'deep-scanning';
  const isAnalyzing = stage === 'fast-scanning' || stage === 'deep-scanning';
  const isScanning = isDeep;
  const hasFastData = !!fast;
  const readiness = fast?.readiness;
  const isFoundationPath = readiness?.recommendedPath === 'foundation';
  const deepPreviewReady = stage === 'complete' && !isFoundationPath && !!deep;
  const deepPreviewLocked = deepPreviewReady && !leadCaptured;
  const showConsultingPreview = stage === 'complete' && !isFoundationPath && leadCaptured && !!deep;
  const showDeepSections = showConsultingPreview;
  const previewActions = buildSurfaceLevelActions(deep?.priorityActions, fast);
  const previewGeoRecommendations = deep?.geoSpecificRecommendations?.slice(0, 2) || [];
  const shareDisabled = !displayUrl;
  const exportDisabled = isExporting || stage !== 'complete';
  const fastPreviewScore =
    fast
      ? Math.round((fast.clarity.clarityScore * 0.55) + (fast.technical.technicalScore * 0.45))
      : null;
  const displayedCompetitors = fast?.competitors?.competitors || [];
  const displayedScore = deep?.overallScore ?? fastPreviewScore;
  const displayedScoreLabel = deep ? 'Overall Score' : 'Preview Score';
  const displayedScoreNote = deep
    ? 'Full audit score'
    : 'Based on clarity and technical scan';

  const technicalIssueLabels: Record<string, string> = {
    missingMetaDescription: 'Missing meta description',
    missingH1: 'Missing H1 tag',
    multipleH1s: 'Multiple H1 tags',
    missingViewport: 'Missing viewport meta tag',
    missingCanonical: 'Missing canonical tag',
    missingSchemaMarkup: 'Missing schema markup',
    lowContentLength: 'Low content length (<300 words)',
    noAltTextOnImages: 'Missing alt text on images',
  };

  const crawlHasIssues = crawl ? Object.values(crawl.issues).some(Boolean) : false;

  const handleLeadFieldChange = (field: keyof DeepReportLeadFormState, value: string) => {
    setLeadForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDeepReportUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLeadError('');

    if (!leadForm.name.trim()) {
      setLeadError('Please enter your name.');
      return;
    }

    if (!isValidEmail(leadForm.email)) {
      setLeadError('Please enter a valid work email.');
      return;
    }

    if (!isLikelyValidPhone(leadForm.phone)) {
      setLeadError('Please enter a valid phone number.');
      return;
    }

    setIsCapturingLead(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          website: displayUrl,
          source: 'report_preview_gate',
          reportData: {
            fast,
            deep,
          },
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Failed to request custom report');
      }

      setLeadCaptured(true);
      setReportJobId(result?.jobId || '');
      setToast({ message: 'Custom report requested. We’ll email the PDF after review.', type: 'success' });

      if (displayUrl && typeof window !== 'undefined') {
        try {
          const storageKey = `deep-report:${normalizeUrl(displayUrl)}`;
          if (result?.jobId) {
            window.sessionStorage.setItem(storageKey, result.jobId);
          } else {
            window.sessionStorage.setItem(storageKey, 'requested');
          }
        } catch {
          // Ignore storage errors in private browsing mode.
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request custom report';
      setLeadError(message);
    } finally {
      setIsCapturingLead(false);
    }
  };

  // Error state
  if (error && stage === 'error') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6">
        <AlertTriangle size={48} className="text-red-400" />
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Scan Failed</div>
          <div className="text-zinc-400 mb-6">{error}</div>
        </div>
        <Link href="/" className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-200">
          Start New Audit
        </Link>
      </div>
    );
  }

  // No data and not loading
  if (!displayUrl && !isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
        <div className="text-red-400">No URL provided.</div>
        <Link href="/" className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-200">
          Start New Audit
        </Link>
      </div>
    );
  }

  // Helper function to safely access dimension data
  const getDimension = (dimensionKey: string, name: string, key: string) => {
    if (!deep || !deep.dimensions?.[dimensionKey as keyof typeof deep.dimensions]) {
      return null;
    }
    const dim = deep.dimensions[dimensionKey as keyof typeof deep.dimensions];
    return {
      name,
      key,
      score: dim?.score || 0,
      verdict: dim?.verdict || 'Awaiting analysis...',
      findings: dim?.findings || [],
    };
  };

  // Build dimensions list for rendering
  const dimensions: DimensionData[] = deep ? [
    getDimension('contentMarketFit', 'Content-Market Fit', 'contentMarketFit'),
    getDimension('credibility', 'Credibility', 'credibility'),
    getDimension('conversionArchitecture', 'Conversion Architecture', 'conversionArchitecture'),
    getDimension('technicalSEO', 'Technical SEO', 'technicalSEO'),
    getDimension('geoReadiness', 'GEO Readiness', 'geoReadiness'),
    getDimension('competitivePosition', 'Competitive Position', 'competitivePosition'),
  ].filter((d) => d !== null) : [];

  // Render streaming progress UI or complete dashboard
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
            <ArrowLeft size={16} /> New Audit
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              disabled={isSharing || shareDisabled}
              className="p-2 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-zinc-400 hover:text-white transition-colors"
              title="Share this audit"
            >
              {isSharing ? <Loader size={18} className="animate-spin" /> : <Share2 size={18} />}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={exportDisabled}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 hover:text-white text-sm font-medium rounded-full flex items-center gap-2 transition-colors"
              title="Export audit as PDF"
            >
              {isExporting ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
              Export
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8" id="audit-report">
        {/* SECTION 1: HEADER BAR */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0A0A0A] to-[#050505] border border-white/5 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between gap-6">
            {/* Left: URL and Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Website Audited</div>
              <div className="text-lg font-semibold text-zinc-100 truncate">{displayUrl}</div>
              <div className="text-sm text-zinc-400 mt-2">Completed in {elapsedTime}</div>
            </div>

            {/* Center: Overall Score Gauge */}
            {displayedScore !== null && (
              <div className="px-6 border-l border-r border-white/5">
                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3 text-center">
                  {displayedScoreLabel}
                </div>
                <CircleGauge score={displayedScore} size={140} />
                <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-zinc-600">
                  {displayedScoreNote}
                </div>
              </div>
            )}

            {/* Right: Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors"
              >
                New Audit
              </Link>
              <button
                onClick={handleExportPDF}
                disabled={exportDisabled}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isExporting ? <Loader size={12} className="animate-spin" /> : <Download size={12} />}
                Export
              </button>
            </div>
          </div>

          {/* Loading Bar */}
          {isLoading && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Loader size={16} className="animate-spin text-green-500" />
                  <div className="text-sm text-zinc-400 font-semibold">
                    {isCrawling ? `Crawling: ${displayUrl}` : isFast ? 'Fast Analysis' : isDeep ? 'Deep Audit' : stageLabels[stage]}
                  </div>
                </div>
                {isCrawling && displayUrl && (
                  <div className="text-xs text-zinc-500">Crawling URL: {displayUrl}</div>
                )}
                {isFast && (
                  <div className="text-xs text-zinc-500">
                    Crawl complete for <span className="text-white">{displayUrl}</span>. Fast analysis is now running.
                  </div>
                )}
                {isScanning && (
                  <div className="text-xs text-zinc-500">Deep scan in progress; crawl and fast scan cards remain visible.</div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <StageStepper stage={stage} />

        {/* Real-time Crawl Results */}
        {(stage !== 'idle' && stage !== 'error') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Crawl Results</h2>
            {!crawl ? (
              <div className="space-y-3">
                <SkeletonLoader />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#121212] border border-white/10 rounded-2xl p-4"
                >
                  <h3 className="text-sm font-semibold text-white mb-2">Meta Tags</h3>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div><span className="text-zinc-500">Title:</span> {crawl.meta.title || 'N/A'}</div>
                    <div><span className="text-zinc-500">Description:</span> {crawl.meta.description || 'N/A'}</div>
                    <div><span className="text-zinc-500">Canonical:</span> {crawl.meta.canonical || 'N/A'}</div>
                    <div><span className="text-zinc-500">Robots:</span> {crawl.meta.robots || 'N/A'}</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#121212] border border-white/10 rounded-2xl p-4"
                >
                  <h3 className="text-sm font-semibold text-white mb-2">Heading Structure</h3>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <div>H1 count: {crawl.headings.h1Count}</div>
                    <div>Multiple H1: {crawl.headings.hasMultipleH1 ? 'Yes' : 'No'}</div>
                    <div>H1 tags: {crawl.headings.h1.join(', ') || 'None'}</div>
                    <div>H2 tags: {crawl.headings.h2.slice(0, 5).join(', ') || 'None'}</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#121212] border border-white/10 rounded-2xl p-4"
                >
                  <h3 className="text-sm font-semibold text-white mb-2">Technical Issues</h3>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {crawlHasIssues ? (
                      Object.entries(crawl.issues).map(([key, value]) => (
                        <div key={key} className={value ? 'text-amber-300' : 'text-emerald-300'}>
                          {technicalIssueLabels[key] || key}: {value ? 'Issue found' : 'OK'}
                        </div>
                      ))
                    ) : (
                      <div className="text-emerald-300">No technical issues found — all core checks passed.</div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Fast analysis results while deep audit is running */}
        {(hasFastData || stage === 'fast-scanning' || stage === 'deep-scanning' || stage === 'complete') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Fast Analysis Snapshot</h2>
            {!fast ? (
              <div className="space-y-3">
                <SkeletonLoader />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fastPreviewScore !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] border border-green-500/20 rounded-2xl p-4 md:col-span-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">Preview Score</h3>
                        <p className="text-xs text-zinc-500">Fast score based on message clarity and technical readiness.</p>
                      </div>
                      <div className="text-4xl font-bold text-white font-space">{fastPreviewScore}<span className="text-sm text-zinc-500">/100</span></div>
                    </div>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#121212] border border-white/10 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Clarity Score</h3>
                  <p className="text-sm text-zinc-400 mb-2">Score: {fast.clarity.clarityScore}/100</p>
                  <p className="text-xs text-zinc-500">{fast.clarity.critique}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#121212] border border-white/10 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Technical Score</h3>
                  <p className="text-sm text-zinc-400 mb-2">Score: {fast.technical.technicalScore}/100</p>
                  <div className="text-xs text-zinc-500">
                    {fast.technical.deductions?.length ? fast.technical.deductions.slice(0, 3).map((d, i) => (
                      <div key={i}>• {d.reason} (-{d.points})</div>
                    )) : 'No deductions available yet.'}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121212] border border-white/10 rounded-2xl p-4 md:col-span-1">
                  <h3 className="text-sm font-semibold text-white mb-2">Competitors</h3>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {displayedCompetitors.length > 0 ? (
                      displayedCompetitors.map((c, idx) => (
                        <div key={idx}>• {c.name}: {c.estimatedVisibility}%</div>
                      ))
                    ) : isAnalyzing ? (
                      <div>Fetching competitor analysis data (deep audit in progress)…</div>
                    ) : (
                      <div>No competitors detected. Try running another full scan or check your input URL.</div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {fast && readiness && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl p-8 border ${
              isFoundationPath
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/25'
            }`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs uppercase tracking-widest text-zinc-400 mb-3">
                  {isFoundationPath ? 'Recommended Next Step' : 'Retainer Upsell Path'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {isFoundationPath ? 'Foundation First' : 'This Site Is Ready for a Strategy-Led Deep Audit'}
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">{readiness.summary}</p>
                <div className="space-y-2">
                  {readiness.reasons.slice(0, 4).map((reason, index) => (
                    <div key={index} className="text-sm text-zinc-300 flex gap-2">
                      <span className="text-zinc-500">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
                {fast.presence?.summary && (
                  <p className="text-xs text-zinc-500 mt-4">{fast.presence.summary}</p>
                )}
                {!isFoundationPath && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-green-300 mb-2">
                      Why we don&apos;t show the whole playbook instantly
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      The preview gives you enough signal to know where the leaks are. The exact sequence, ownership, and rollout plan are reserved for the call so your team doesn&apos;t get a generic checklist.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 min-w-[220px]">
                <a
                  href={contact.primaryHref}
                  target={contact.openInNewTab ? '_blank' : undefined}
                  rel={contact.openInNewTab ? 'noreferrer' : undefined}
                  className="px-5 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider rounded-lg text-center hover:bg-zinc-200 transition-colors"
                >
                  {isFoundationPath ? 'Start Foundation Package' : 'Book the Strategy Call'}
                </a>
                <a
                  href={contact.secondaryHref}
                  className="px-5 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold uppercase tracking-wider rounded-lg text-center hover:bg-white/10 transition-colors"
                >
                  {isFoundationPath ? contact.secondaryLabel : 'Ask a Question First'}
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {deepPreviewLocked && displayUrl && (
          <DeepReportGate
            form={leadForm}
            error={leadError}
            isSubmitting={isCapturingLead}
            website={displayUrl}
            onChange={handleLeadFieldChange}
            onSubmit={handleDeepReportUnlock}
            primaryHref={contact.primaryHref}
            primaryLabel={contact.primaryLabel}
            openInNewTab={contact.openInNewTab}
          />
        )}

        {/* SECTION 2: EXECUTIVE SUMMARY */}

        {showConsultingPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8"
          >
            <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Custom Report Preview</h2>
                <p className="text-xs text-zinc-500 mt-2">
                  The report is now in queue for manual review. This page stays intentionally high level so the PDF and the paid strategy call still do the heavy lifting.
                </p>
              </div>
              <a
                href={contact.primaryHref}
                target={contact.openInNewTab ? '_blank' : undefined}
                rel={contact.openInNewTab ? 'noreferrer' : undefined}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                Book Paid Strategy Call
              </a>
            </div>
            
            {isLoading ? (
              <SkeletonLoader />
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <div className="text-xs uppercase tracking-widest text-green-300 mb-2">Delivery Status</div>
                  <p className="text-sm text-zinc-200">
                    We&apos;re preparing the consultant-style PDF for your inbox.
                    {reportJobId ? (
                      <>
                        {' '}Your review ID is <span className="font-semibold text-white">{reportJobId}</span>.
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">
                    Reserve the paid strategy call now if you want us to walk through priorities, rollout order, and whether we should handle implementation.
                  </p>
                </div>

                {/* Summary Text */}
                <p className="text-sm text-zinc-300 leading-relaxed">{deep?.executiveSummary}</p>

                {/* Tags */}
                {fast && (
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-300">
                      {fast.classification.industry}
                    </div>
                    <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-300">
                      {fast.classification.niche}
                    </div>
                  </div>
                )}

                {/* Clarity Score with Gauge */}
                {fast && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Message Clarity Analysis</div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{fast.clarity.critique}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Clarity Score</div>
                      <CircleGauge score={fast.clarity.clarityScore} size={120} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-widest text-green-300 mb-3">
                      Surface-Level Actions
                    </div>
                    <div className="space-y-3">
                      {previewActions.map((action, index) => (
                        <div key={index} className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="text-sm font-semibold text-white mb-1">{action.title}</div>
                          <div className="text-xs text-zinc-400">{action.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-widest text-amber-300 mb-3">
                      Held For The Call
                    </div>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div>Exact rollout sequence and owners</div>
                      <div>Content briefs, prompt strategy, and keyword map</div>
                      <div>Outreach targets and competitor playbook</div>
                      <div>What to fix first to avoid wasted effort</div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={contact.primaryHref}
                        target={contact.openInNewTab ? '_blank' : undefined}
                        rel={contact.openInNewTab ? 'noreferrer' : undefined}
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200"
                      >
                        Review On Paid Call
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SECTION 3: SCORE BREAKDOWN (6 Dimension Cards) */}
        {showDeepSections && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Dimension Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimensions.map((dimension) => (
                <DimensionCard
                  key={dimension.key}
                  dimension={dimension}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* SECTION 4: PRIORITY ACTIONS */}
        {showDeepSections && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8"
          >
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Target size={20} />
              First Actions To Take
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              We&apos;re intentionally showing the first few actions only. The full implementation sequence is where most teams need help.
            </p>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-zinc-800/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {previewActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-zinc-900/30 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-lg font-bold text-zinc-500 shrink-0 w-6">{index + 1}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                        <p className="text-sm text-zinc-400 mb-3">{action.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <ImpactBadge impact={action.impact} />
                          <EffortBadge effort={action.effort} />
                          <CategoryTag category={action.category} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  The missing piece is sequencing: which page, prompt, and authority fix should happen first. That prioritization is what we map on the call.
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SECTION 5: GEO RECOMMENDATIONS */}
        {showDeepSections && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A] border border-emerald-500/20 rounded-2xl p-8"
          >
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Lightbulb size={20} className="text-emerald-400" />
              GEO Opportunities
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              These are the first AI-search opportunities we&apos;d push. We keep the exact content and citation plan for the call.
            </p>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-zinc-800/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {previewGeoRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 hover:border-emerald-500/40 transition-colors"
                  >
                    <h3 className="font-semibold text-emerald-300 mb-2">{rec.title}</h3>
                    <p className="text-sm text-zinc-400 mb-2">{rec.description}</p>
                    <p className="text-xs text-zinc-500 italic">Why it matters: {rec.rationale}</p>
                  </motion.div>
                ))}
                <div className="rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-zinc-300">
                  We&apos;ll use the strategy call to decide which entities, citations, and content angles give you the fastest lift.
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SECTION 6: TECHNICAL DETAILS */}

          
        {(crawl || fast) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedTechnical(!expandedTechnical)}
              className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap size={20} />
                Technical Details
              </h2>
              {expandedTechnical ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

                        {expandedTechnical && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-white/5 px-8 py-6 space-y-6 max-h-[500px] overflow-y-auto"
              >
                {/* Schema Types */}
                {crawl?.technical.schemaTypes && crawl.technical.schemaTypes.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Schema Markup Found</div>
                    <div className="flex flex-wrap gap-2">
                      {crawl.technical.schemaTypes.map((schemaType: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full text-xs font-mono">
                          {schemaType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Deductions */}
                {fast?.technical.deductions && fast.technical.deductions.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Technical Score Deductions</div>
                    <div className="space-y-2">
                      {fast.technical.deductions.map((deduction, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-red-400 shrink-0">-{deduction.points}</span>
                          <span className="text-zinc-400">{deduction.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Crawl Issues */}
                {crawl && Object.entries(crawl.issues).some(([_, v]) => v) && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-400 mb-3">Issues Detected</div>
                    <div className="space-y-2">
                      {crawl.issues.missingMetaDescription && <div className="text-sm text-amber-300">• Missing meta description</div>}
                      {crawl.issues.missingH1 && <div className="text-sm text-amber-300">• Missing H1 tag</div>}
                      {crawl.issues.multipleH1s && <div className="text-sm text-amber-300">• Multiple H1 tags found</div>}
                      {crawl.issues.missingCanonical && <div className="text-sm text-amber-300">• Missing canonical tag</div>}
                      {crawl.issues.missingSchemaMarkup && <div className="text-sm text-amber-300">• Missing schema markup</div>}
                      {crawl.issues.lowContentLength && <div className="text-sm text-amber-300">• Low content length (&lt; 300 words)</div>}
                      {crawl.issues.noAltTextOnImages && <div className="text-sm text-amber-300">• Missing alt text on images</div>}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SECTION 7: CTA / UPSELL BANNER */}
        {stage === 'complete' && !isFoundationPath && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-3">Don&apos;t let this sit as another report in the inbox.</h2>
            <p className="text-zinc-300 mb-6">
              The preview shows where the leaks are. The strategy call is where we decide what to fix first, how aggressive the rollout should be, and whether we should handle the implementation for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={contact.primaryHref}
                target={contact.openInNewTab ? '_blank' : undefined}
                rel={contact.openInNewTab ? 'noreferrer' : undefined}
                className="inline-block px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Book Strategy Call
              </a>
              <Link
                href="/audit-flow"
                className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
              >
                Get Another Audit
              </Link>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              Teams that wait usually end up fixing the wrong pages first.
            </div>
          </motion.div>
        )}

        {stage === 'complete' && isFoundationPath && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-amber-500/15 to-red-500/10 border border-amber-500/25 rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-3">This site needs foundational work before a true deep audit pays off.</h2>
            <p className="text-zinc-300 mb-6">
              We can help you fix the basics fast, then rerun the audit once your content and trust signals are strong enough to compete.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={contact.primaryHref}
                target={contact.openInNewTab ? '_blank' : undefined}
                rel={contact.openInNewTab ? 'noreferrer' : undefined}
                className="inline-block px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Book Foundation Call
              </a>
              <a
                href={contact.secondaryHref}
                className="inline-block px-8 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors"
              >
                Email Our Team
              </a>
            </div>
          </motion.div>
        )}

        {/* LOADING PLACEHOLDER */}
        {isLoading && !deep && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-[#0A0A0A] border border-green-500/20 rounded-3xl p-12 text-center"
          >
            <Loader size={48} className="mx-auto mb-4 text-green-500 animate-spin" />
            <div className="text-zinc-400">
              {isCrawling && 'Fetching your website...'}
              {stage === 'fast-scanning' && 'Analyzing content...'}
              {stage === 'deep-scanning' && 'Deep scan in progress; fast scan results remain visible...'}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
