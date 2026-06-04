import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DeepReportReviewActions from '@/components/DeepReportReviewActions';
import { listDeepReportJobs } from '@/lib/report-jobs';
import { hasReviewPageAccess } from '@/lib/review-auth';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Review Queue',
  description: 'Internal review queue for deep report jobs.',
  path: '/review',
  noIndex: true,
});

function statusClasses(status: string) {
  switch (status) {
    case 'sent':
      return 'border-green-500/20 bg-green-500/10 text-green-300';
    case 'awaiting_review':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    case 'processing':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
    case 'failed':
      return 'border-red-500/20 bg-red-500/10 text-red-300';
    default:
      return 'border-white/10 bg-white/5 text-zinc-300';
  }
}

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  if (!hasReviewPageAccess(searchParams?.token)) {
    redirect('/');
  }

  const jobs = await listDeepReportJobs();
  const tokenSuffix = searchParams?.token ? `?token=${encodeURIComponent(searchParams.token)}` : '';

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Internal Review Queue</div>
            <h1 className="mt-2 text-3xl font-bold">Deep Report Jobs</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Process queued jobs, review the consultant-style report, and approve the PDF email once the findings are strong enough to send.
            </p>
          </div>
          <DeepReportReviewActions />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A]">
          <div className="grid grid-cols-[1.1fr_1fr_0.7fr_0.8fr] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <div>Lead</div>
            <div>Website</div>
            <div>Status</div>
            <div>Next Step</div>
          </div>
          {jobs.length === 0 ? (
            <div className="px-6 py-10 text-sm text-zinc-400">No report jobs yet.</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-1 gap-4 border-b border-white/5 px-6 py-5 last:border-b-0 md:grid-cols-[1.1fr_1fr_0.7fr_0.8fr]"
              >
                <div>
                  <div className="font-semibold text-white">{job.lead.name}</div>
                  <div className="text-sm text-zinc-400">{job.lead.email}</div>
                  <div className="mt-1 text-xs text-zinc-500">{job.lead.phone}</div>
                </div>
                <div>
                  <div className="font-medium text-zinc-200">{job.website}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {job.brandName} • {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClasses(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  {job.report?.compositeScore ? (
                    <div className="mt-2 text-sm text-zinc-400">Score {job.report.compositeScore}/100</div>
                  ) : null}
                </div>
                <div className="flex items-center md:justify-end">
                  <Link
                    href={`/review/${job.id}${tokenSuffix}`}
                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                  >
                    Open Job
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
