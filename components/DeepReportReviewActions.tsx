'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DeepReportReviewActionsProps {
  jobId?: string;
  status?: string;
  hasReport?: boolean;
}

export default function DeepReportReviewActions({ jobId, status, hasReport }: DeepReportReviewActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isProcessingNext, setIsProcessingNext] = useState(false);
  const token = searchParams.get('token');

  async function runAction(path: string, successMessage: string) {
    setError('');
    setMessage('');

    const response = await fetch(token ? `${path}?token=${encodeURIComponent(token)}` : path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || result?.error || 'Action failed');
    }

    setMessage(successMessage);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {jobId && status === 'queued' ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => void runAction(`/api/deep-report/process/${jobId}`, 'Report processed and moved to review.')}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Processing...' : 'Process Report'}
          </button>
        ) : null}

        {jobId && status === 'failed' ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => void runAction(`/api/deep-report/process/${jobId}`, 'Report reprocessed and moved to review.')}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Reprocessing...' : 'Retry Processing'}
          </button>
        ) : null}

        {jobId && status === 'awaiting_review' && hasReport ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => void runAction(`/api/deep-report/approve/${jobId}`, 'Report approved and emailed to the lead.')}
            className="rounded-full bg-green-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Sending...' : 'Approve & Email PDF'}
          </button>
        ) : null}

        {!jobId ? (
          <button
            type="button"
            disabled={isProcessingNext}
            onClick={async () => {
              try {
                setError('');
                setMessage('');
                setIsProcessingNext(true);
                await runAction('/api/deep-report/process', 'Next queued report processed.');
              } catch (actionError) {
                setError(actionError instanceof Error ? actionError.message : 'Failed to process next report');
              } finally {
                setIsProcessingNext(false);
              }
            }}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessingNext ? 'Processing...' : 'Process Next Queued Report'}
          </button>
        ) : null}
      </div>

      {message ? <div className="text-sm text-green-300">{message}</div> : null}
      {error ? <div className="text-sm text-red-300">{error}</div> : null}
    </div>
  );
}
