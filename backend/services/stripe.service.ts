import 'server-only';

import crypto from 'node:crypto';
import { STRIPE_API_BASE, getAppUrl, getStripeSecretKey, getStripeWebhookSecret } from '@/backend/config/stripe';

export async function createStripeCheckoutSession(input: {
  domain: string;
  amount: number;
  currency: string;
  userId: string;
  userEmail: string;
  type: string;
}) {
  const appUrl = getAppUrl();
  const params = new URLSearchParams();

  params.set('mode', 'payment');
  params.set('success_url', `${appUrl}/audit/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${appUrl}/audit/cancel`);
  params.set('customer_email', input.userEmail);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', input.currency);
  params.set('line_items[0][price_data][unit_amount]', String(input.amount));
  params.set('line_items[0][price_data][product_data][name]', 'Fresh SEO + AEO Audit');
  params.set('line_items[0][price_data][product_data][description]', `Brand-new live audit for ${input.domain}`);
  params.set('metadata[domain]', input.domain);
  params.set('metadata[userId]', input.userId);
  params.set('metadata[type]', input.type);

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || 'Failed to create Stripe Checkout session.');
  }

  return result as { id: string; url: string };
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  if (!signatureHeader) {
    throw new Error('Missing Stripe signature.');
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const expectedSignature = parts.v1;

  if (!timestamp || !expectedSignature) {
    throw new Error('Invalid Stripe signature.');
  }

  const timestampMs = Number(timestamp) * 1000;
  const toleranceMs = 5 * 60 * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > toleranceMs) {
    throw new Error('Stripe signature timestamp is outside the allowed tolerance.');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const actualSignature = crypto.createHmac('sha256', getStripeWebhookSecret()).update(signedPayload).digest('hex');

  if (
    actualSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(actualSignature), Buffer.from(expectedSignature))
  ) {
    throw new Error('Stripe signature verification failed.');
  }
}
