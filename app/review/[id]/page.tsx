import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import DeepReportReviewActions from '@/components/DeepReportReviewActions';
import { getDeepReportJob } from '@/lib/report-jobs';
import { hasReviewPageAccess } from '@/lib/review-auth';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Review Job',
  description: 'Internal job review page.',
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

export default async function ReviewJobPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { token?: string };
}) {
  if (!hasReviewPageAccess(searchParams?.token)) {
    redirect('/');
  }

  let job;
  try {
    job = await getDeepReportJob(params.id);
  } catch {
    notFound();
  }

  const tokenSuffix = searchParams?.token ? `?token=${encodeURIComponent(searchParams.token)}` : '';

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href={`/review${tokenSuffix}`} className="text-sm text-zinc-500 hover:text-zinc-300">
              Back to Queue
            </Link>
            <h1 className="mt-3 text-3xl font-bold">{job.brandName}</h1>
            <p className="mt-2 text-sm text-zinc-400">{job.website}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
              <span>Job ID {job.id}</span>
              <span>Lead {job.lead.name}</span>
              <span>{job.lead.email}</span>
            </div>
          </div>
          <div className="space-y-3 md:text-right">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClasses(job.status)}`}>
              {job.status.replace('_', ' ')}
            </span>
            <DeepReportReviewActions jobId={job.id} status={job.status} hasReport={Boolean(job.report)} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Lead</div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-zinc-500">Name</div>
                <div>{job.lead.name}</div>
              </div>
              <div>
                <div className="text-zinc-500">Email</div>
                <div>{job.lead.email}</div>
              </div>
              <div>
                <div className="text-zinc-500">Phone</div>
                <div>{job.lead.phone}</div>
              </div>
              <div>
                <div className="text-zinc-500">Company</div>
                <div>{job.lead.company || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-zinc-500">Source</div>
                <div>{job.source}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Report Summary</div>
            {job.report ? (
              <div className="mt-4 space-y-5">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-green-300">Composite Score</div>
                  <div className="mt-2 text-4xl font-bold">{job.report.compositeScore}/100</div>
                </div>
                <p className="text-sm leading-7 text-zinc-300">{job.report.executiveSummary}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {job.report.scorecard.map((dimension) => (
                    <div key={dimension.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold text-white">{dimension.label}</div>
                      <div className="mt-2 flex items-center justify-between text-sm text-zinc-300">
                        <span>{dimension.score}/100</span>
                        <span>{dimension.status}</span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-zinc-400">{dimension.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-zinc-400">
                This job has not been processed yet. Run the processor first, then review the generated report here before sending the PDF.
              </div>
            )}
          </section>
        </div>

        {job.report ? (
          <section className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Withheld For The Paid Call</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {job.report.withheldFromReport.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
