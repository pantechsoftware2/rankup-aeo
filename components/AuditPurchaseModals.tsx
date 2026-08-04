'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader, X } from 'lucide-react';

type AuthMode = 'login' | 'signup';

interface PricingModalProps {
  domain: string;
  isOpen: boolean;
  isLoading: boolean;
  error: string;
  onClose: () => void;
  onContinue: () => Promise<void>;
}

interface AuthModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string;
  onClose: () => void;
  onAuthenticated: () => Promise<void>;
}

const features = ['Fresh crawl', 'Latest AI analysis', 'Updated rankings', 'PDF report'];

function ModalShell({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 px-4 py-4 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-t-[20px] border border-white/10 bg-[#090a0a]/95 p-5 shadow-2xl shadow-black/50 sm:rounded-[20px] sm:p-6"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PricingModal({ domain, isOpen, isLoading, error, onClose, onContinue }: PricingModalProps) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400">$10 audit regeneration</div>
          <h2 className="text-2xl font-bold text-white">Generate Fresh Audit</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close pricing modal"
        >
          <X size={18} />
        </button>
      </div>

      <p className="mb-5 text-sm leading-6 text-zinc-300">
        You have already used your free audit for <span className="font-semibold text-white">{domain}</span>.
        Generate a brand-new live SEO + AEO audit for only $10.
      </p>

      <div className="mb-5 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm text-zinc-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/15 text-green-300">
              <Check size={13} />
            </span>
            {feature}
          </div>
        ))}
      </div>

      {error ? <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-green-300 disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? <Loader size={17} className="animate-spin" /> : null}
        {isLoading ? 'Preparing checkout...' : 'Pay $10'}
      </button>
    </ModalShell>
  );
}

export function AuthModal({ isOpen, isLoading, error, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError('');
    setVerificationMessage('');

    if (mode === 'signup' && !form.fullName.trim()) {
      setLocalError('Enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setLocalError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setLocalError(result?.error || 'Authentication failed.');
        return;
      }

      if (result?.requiresVerification) {
        setLocalError('');
        setVerificationMessage(result.message || 'Check your email to verify your account before logging in.');
        return;
      }

      await onAuthenticated();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Unable to reach authentication. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const continueWithGoogle = () => {
    window.location.href = '/api/auth/google/start?next=/';
  };

  const shownError = localError || error;
  const buttonLoading = authLoading || isLoading;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Continue to Purchase</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Create your free RankUp account to purchase and manage your audits.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close authentication modal"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {(['login', 'signup'] as AuthMode[]).map((tab) => (
          <button
            key={tab}
            type="button"
            disabled={buttonLoading}
            onClick={() => {
              setMode(tab);
              setLocalError('');
              setVerificationMessage('');
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
            placeholder="Full Name"
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

        {shownError ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{shownError}</div> : null}
        {verificationMessage ? (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {verificationMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={buttonLoading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-green-300 disabled:cursor-wait disabled:opacity-70"
        >
          {buttonLoading ? <Loader size={17} className="animate-spin" /> : null}
          {authLoading ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Continue'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-600">
        <div className="h-px flex-1 bg-white/10" />
        or
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        disabled={buttonLoading}
        onClick={continueWithGoogle}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-70"
      >
        Continue with Google
      </button>
    </ModalShell>
  );
}
