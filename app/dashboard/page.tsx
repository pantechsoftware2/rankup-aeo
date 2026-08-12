import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAuditUser } from '@/backend/services/auth.service';
import { getActivePlanForUser } from '@/backend/services/payment-record.service';
import DashboardResumeCheckout from '@/components/DashboardResumeCheckout';
import { formatAuditRegenerationPrice } from '@/lib/audit-pricing';

function formatPlanName(plan?: string | null) {
  if (!plan) {
    return 'No active paid plan';
  }

  return plan
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function DashboardPage() {
  const user = await getCurrentAuditUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const activePlan = await getActivePlanForUser(user.id);

  return (
    <main className="min-h-screen bg-black px-4 py-28">
      <section className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">Dashboard</p>
        <h1 className="text-4xl font-bold text-white">Welcome, {user.fullName}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
          You are signed in as {user.email}. Paid audit access starts only after the {formatAuditRegenerationPrice()} payment is confirmed.
        </p>
        <div className="mt-8 max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Active plan</div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-white">{formatPlanName(activePlan?.plan)}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {activePlan?.updatedAt
                  ? `Activated ${new Date(activePlan.updatedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}`
                  : 'Paid plan will appear here after payment is confirmed.'}
              </div>
            </div>
            {activePlan ? (
              <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-300">
                Active
              </span>
            ) : (
              <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-200">
                Payment required
              </span>
            )}
          </div>
          {!activePlan ? (
            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-green-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-green-300"
            >
              Run audit and pay {formatAuditRegenerationPrice()}
            </Link>
          ) : null}
        </div>
        <DashboardResumeCheckout />
      </section>
    </main>
  );
}
