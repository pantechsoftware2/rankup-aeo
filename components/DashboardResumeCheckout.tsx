'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

export default function DashboardResumeCheckout() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const resumeCheckout = async () => {
      const rawIntent = window.sessionStorage.getItem('rankup:purchase-intent');
      if (!rawIntent) {
        return;
      }

      const domain = JSON.parse(rawIntent)?.domain;
      if (!domain) {
        window.sessionStorage.removeItem('rankup:purchase-intent');
        return;
      }

      setMessage('Resuming your audit checkout...');
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          amount: 1000,
          currency: 'usd',
          type: 'audit_regeneration',
        }),
      });
      const result = await response.json().catch(() => null);

      if (cancelled) {
        return;
      }

      if (!response.ok || !result?.url) {
        setMessage(result?.error || 'Unable to resume checkout. Please run the audit again.');
        return;
      }

      window.sessionStorage.removeItem('rankup:purchase-intent');
      window.location.href = result.url;
    };

    resumeCheckout().catch((error) => {
      if (!cancelled) {
        setMessage(error instanceof Error ? error.message : 'Unable to resume checkout.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="mt-8 flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200">
      {message.includes('Resuming') ? <Loader size={16} className="animate-spin text-green-300" /> : null}
      {message}
    </div>
  );
}
