'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardResumeCheckout() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const returnToPayPrompt = () => {
      const rawIntent = window.sessionStorage.getItem('rankup:purchase-intent');
      if (!rawIntent) {
        return;
      }

      const domain = JSON.parse(rawIntent)?.domain;
      if (!domain) {
        window.sessionStorage.removeItem('rankup:purchase-intent');
        return;
      }

      setMessage('Returning to the audit payment prompt...');
      router.replace('/');
    };

    returnToPayPrompt();
  }, [router]);

  if (!message) {
    return null;
  }

  return (
    <div className="mt-8 flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200">
      {message}
    </div>
  );
}
