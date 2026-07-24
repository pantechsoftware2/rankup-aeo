import Link from 'next/link';

export default function AuditPaymentCancelPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Checkout canceled</div>
        <h1 className="mb-4 text-3xl font-bold">No payment was taken.</h1>
        <p className="mb-6 text-sm leading-6 text-zinc-300">
          You can return to the audit flow whenever you want to generate a fresh paid audit.
        </p>
        <Link href="/" className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">
          Back to RankUp
        </Link>
      </div>
    </main>
  );
}
