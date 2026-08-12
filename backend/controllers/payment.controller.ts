import { NextResponse } from 'next/server';
import { runAuditPipelineAndStore } from '@/backend/services/audit-history.service';
import { createStripeCheckoutSession, verifyStripeWebhookSignature } from '@/backend/services/stripe.service';
import { requireAuditUser } from '@/backend/middleware/auth.middleware';
import { normalizeAuditDomain } from '@/backend/utils/domain';
import { unlockPremiumAccess, upsertPaymentRecord } from '@/backend/services/payment-record.service';
import {
  AUDIT_REGENERATION_AMOUNT_PAISE,
  AUDIT_REGENERATION_CURRENCY,
  AUDIT_REGENERATION_PLAN,
} from '@/lib/audit-pricing';

export async function createCheckoutSession(req: Request) {
  try {
    const user = await requireAuditUser();
    const body = await req.json();
    const domain = normalizeAuditDomain(body?.domain || '');
    const amount = Number(body?.amount || AUDIT_REGENERATION_AMOUNT_PAISE);
    const currency = String(body?.currency || AUDIT_REGENERATION_CURRENCY).toLowerCase();
    const type = String(body?.type || AUDIT_REGENERATION_PLAN);

    if (
      amount !== AUDIT_REGENERATION_AMOUNT_PAISE ||
      currency !== AUDIT_REGENERATION_CURRENCY ||
      type !== AUDIT_REGENERATION_PLAN
    ) {
      return NextResponse.json({ error: 'Invalid checkout request.' }, { status: 400 });
    }

    const session = await createStripeCheckoutSession({
      domain,
      amount,
      currency,
      type,
      userId: user.id,
      userEmail: user.email,
    });

    try {
      await upsertPaymentRecord({
        userId: user.id,
        email: user.email,
        plan: type,
        paymentStatus: 'pending',
        stripeCustomerId: null,
        stripeSessionId: session.id,
        webhookVerified: false,
      });
    } catch (recordError) {
      console.warn('[Payments] Checkout session created without pending payment record.', recordError);
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session.';
    return NextResponse.json(
      message === 'Authentication required.' ? { requiresAuth: true } : { error: message },
      { status: message === 'Authentication required.' ? 401 : 500 }
    );
  }
}

export async function handleStripeWebhook(req: Request) {
  const payload = await req.text();

  try {
    verifyStripeWebhookSignature(payload, req.headers.get('stripe-signature'));
    const event = JSON.parse(payload);

    if (event?.type === 'checkout.session.completed') {
      const session = event.data?.object;
      const domain = session?.metadata?.domain;
      const userId = session?.metadata?.userId;
      const email = session?.metadata?.email || session?.customer_details?.email || session?.customer_email;
      const plan = session?.metadata?.plan || session?.metadata?.type || AUDIT_REGENERATION_PLAN;
      const stripeCustomerId = typeof session?.customer === 'string' ? session.customer : null;

      if (domain && session?.id) {
        if (userId && email) {
          try {
            await upsertPaymentRecord({
              userId,
              email,
              plan,
              paymentStatus: 'paid',
              stripeCustomerId,
              stripeSessionId: session.id,
              webhookVerified: true,
            });
            await unlockPremiumAccess({ userId, stripeCustomerId });
          } catch (recordError) {
            console.warn('[Payments] Paid payment record update failed.', recordError);
          }
        }

        await runAuditPipelineAndStore({
          userId,
          domain,
          freeAuditUsed: true,
          paymentStatus: 'paid',
          stripeSessionId: session.id,
          paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amountPaid: typeof session.amount_total === 'number' ? session.amount_total : null,
          customerEmail: session.customer_details?.email || session.customer_email || null,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handling failed.' },
      { status: 400 }
    );
  }
}
