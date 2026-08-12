'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import { useScanContext } from '@/lib/scan-context';
import { AuthModal, PricingModal } from '@/components/AuditPurchaseModals';
import {
  AUDIT_REGENERATION_AMOUNT_PAISE,
  AUDIT_REGENERATION_CURRENCY,
  AUDIT_REGENERATION_PLAN,
} from '@/lib/audit-pricing';

export default function HomePageClient() {
  const router = useRouter();
  const { startScan, paymentRequirement, clearPaymentRequirement } = useScanContext();
  const [pendingDomain, setPendingDomain] = useState('');
  const [pricingOpen, setPricingOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');

  const handleAnalyze = async (website: string) => {
    const result = await startScan(website);

    if ('requiresPayment' in result) {
      setPendingDomain(result.domain);
      setPurchaseError('');
      const authResponse = await fetch('/api/auth/me');
      const authResult = await authResponse.json().catch(() => null);

      if (!authResult?.authenticated) {
        window.sessionStorage.setItem('rankup:purchase-intent', JSON.stringify({ domain: result.domain }));
        router.push('/login?next=/');
        return;
      }

      setPricingOpen(true);
      return;
    }

    const encodedUrl = encodeURIComponent(website);
    router.push(`/report-preview?url=${encodedUrl}`);
  };

  const startCheckout = useCallback(async (domain: string) => {
    setCheckoutLoading(true);
    setPurchaseError('');

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          amount: AUDIT_REGENERATION_AMOUNT_PAISE,
          currency: AUDIT_REGENERATION_CURRENCY,
          type: AUDIT_REGENERATION_PLAN,
        }),
      });

      const result = await response.json().catch(() => null);
      if (response.status === 401 || result?.requiresAuth) {
        window.sessionStorage.setItem('rankup:purchase-intent', JSON.stringify({ domain }));
        setAuthOpen(true);
        return;
      }

      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Unable to start checkout.');
      }

      window.sessionStorage.removeItem('rankup:purchase-intent');
      window.location.href = result.url;
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : 'Unable to start checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  }, []);

  const handlePricingContinue = useCallback(async () => {
    const domain = pendingDomain || paymentRequirement?.domain;
    if (!domain) {
      setPurchaseError('Domain not found. Please run the audit again.');
      return;
    }
    await startCheckout(domain);
  }, [paymentRequirement?.domain, pendingDomain, startCheckout]);

  const handleAuthenticated = useCallback(async () => {
    setAuthOpen(false);

    let domain = pendingDomain || paymentRequirement?.domain;
    try {
      const intent = window.sessionStorage.getItem('rankup:purchase-intent');
      if (intent) {
        domain = JSON.parse(intent)?.domain || domain;
      }
      window.sessionStorage.removeItem('rankup:purchase-intent');
    } catch {
      // Keep the in-memory domain if storage parsing fails.
    }

    if (domain) {
      await startCheckout(domain);
    }
  }, [paymentRequirement?.domain, pendingDomain, startCheckout]);

  useEffect(() => {
    const intent = window.sessionStorage.getItem('rankup:purchase-intent');
    if (!intent) {
      return;
    }

    let cancelled = false;

    const resumePayPrompt = async () => {
      let domain = '';
      try {
        domain = JSON.parse(intent)?.domain || '';
      } catch {
        window.sessionStorage.removeItem('rankup:purchase-intent');
        return;
      }

      if (!domain) {
        window.sessionStorage.removeItem('rankup:purchase-intent');
        return;
      }

      const response = await fetch('/api/auth/me');
      const result = await response.json().catch(() => null);

      if (!cancelled && result?.authenticated) {
        setPendingDomain(domain);
        setPurchaseError('');
        setPricingOpen(true);
      }
    };

    resumePayPrompt().catch(() => {
      if (!cancelled) {
        setPurchaseError('Unable to resume your payment prompt after login. Please try again.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') {
      return;
    }

    const sessionId = params.get('session_id') || '';
    if (!sessionId) {
      setPaymentNotice('Payment received. You can run SEO audits from this page.');
      return;
    }

    let cancelled = false;

    const confirmPayment = async () => {
      setPaymentNotice('Confirming your payment...');

      const response = await fetch('/api/payments/confirm-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const result = await response.json().catch(() => null);

      if (cancelled) {
        return;
      }

      if (!response.ok || !result?.paid) {
        setPaymentNotice(result?.error || 'Payment confirmation is still processing. Please refresh in a moment.');
        return;
      }

      setPaymentNotice('Payment successful. Your SEO audits are active now.');
      router.replace('/', { scroll: false });
    };

    confirmPayment().catch((error) => {
      if (!cancelled) {
        setPaymentNotice(error instanceof Error ? error.message : 'Unable to confirm payment.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const closePricing = useCallback(() => {
    setPricingOpen(false);
    setPurchaseError('');
    window.sessionStorage.removeItem('rankup:purchase-intent');
    clearPaymentRequirement();
  }, [clearPaymentRequirement]);

  return (
    <>
      <Hero onAnalyze={handleAnalyze} />
      {paymentNotice ? (
        <div className="fixed left-1/2 top-24 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-green-400/20 bg-[#07120b]/95 px-4 py-3 text-sm font-semibold text-green-100 shadow-2xl shadow-black/30">
          {paymentNotice}
        </div>
      ) : null}
      <PricingModal
        domain={pendingDomain || paymentRequirement?.domain || 'this domain'}
        isOpen={pricingOpen || Boolean(paymentRequirement)}
        isLoading={checkoutLoading}
        error={purchaseError}
        onClose={closePricing}
        onContinue={handlePricingContinue}
      />
      <AuthModal
        isOpen={authOpen}
        isLoading={checkoutLoading}
        error={purchaseError}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
}
