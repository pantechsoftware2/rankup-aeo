import Link from 'next/link';

export default function AuditPaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id || '';

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-green-500/20 bg-green-500/10 p-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-green-300">Payment received</div>
        <h1 className="mb-4 text-3xl font-bold">Your fresh audit is being generated.</h1>
        <p className="mb-6 text-sm leading-6 text-zinc-300">
          Stripe confirmed the purchase. The webhook now starts a brand-new crawl and analysis, then stores the paid audit in your history.
        </p>
        {sessionId ? (
          <p className="mb-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-zinc-400">
            Session: {sessionId}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-black transition hover:bg-zinc-200">
            Back to RankUp
          </Link>
          {sessionId ? (
            <Link
              href={`/api/audits/by-session/${encodeURIComponent(sessionId)}`}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              Check Audit Status
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
