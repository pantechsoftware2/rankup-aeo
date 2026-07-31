'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

type AuthMode = 'login' | 'signup';

function safeNext(path: string) {
  return path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard';
}

export default function AuthPageClient({
  initialMode,
  initialError = '',
  nextPath = '/dashboard',
}: {
  initialMode: AuthMode;
  initialError?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || 'Authentication failed.');
      }

      if (result?.requiresVerification) {
        setNotice(result.message || 'Check your email to verify your account before logging in.');
        return;
      }

      router.replace(safeNext(nextPath));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = () => {
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(safeNext(nextPath))}`;
  };

  return (
    <main className="min-h-screen bg-black px-4 py-28">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">RankUp account</p>
          <h1 className="text-3xl font-bold text-white">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in to manage audits, billing, and premium reports.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(['login', 'signup'] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              type="button"
              disabled={loading}
              onClick={() => {
                setMode(tab);
                setError('');
                setNotice('');
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === tab ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' ? (
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-green-400/50"
              placeholder="Full name"
              autoComplete="name"
            />
          ) : null}
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-green-400/50"
            placeholder="Email"
            autoComplete="email"
            type="email"
          />
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-green-400/50"
            placeholder="Password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            type="password"
          />

          {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          {notice ? <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">{notice}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-green-300 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <Loader size={17} className="animate-spin" /> : null}
            {loading ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Continue'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-600">
          <div className="h-px flex-1 bg-white/10" />
          or
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={continueWithGoogle}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-70"
        >
          Continue with Google
        </button>
      </section>
    </main>
  );
}
