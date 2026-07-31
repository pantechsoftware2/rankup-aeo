import { redirect } from 'next/navigation';
import { getCurrentAuditUser } from '@/backend/services/auth.service';
import DashboardResumeCheckout from '@/components/DashboardResumeCheckout';

export default async function DashboardPage() {
  const user = await getCurrentAuditUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  return (
    <main className="min-h-screen bg-black px-4 py-28">
      <section className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">Dashboard</p>
        <h1 className="text-4xl font-bold text-white">Welcome, {user.fullName}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
          Your RankUp account is active. Audit history, billing, and premium reports are tied to {user.email}.
        </p>
        <DashboardResumeCheckout />
      </section>
    </main>
  );
}
