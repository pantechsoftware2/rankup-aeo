import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { AUDIT_REGENERATION_PLAN } from '@/lib/audit-pricing';

const TABLE_NAME = 'payments';

export type ActivePlan = {
  plan: string;
  paymentStatus: 'paid';
  stripeSessionId: string | null;
  stripeCustomerId: string | null;
  updatedAt: string | null;
};

export async function upsertPaymentRecord(input: {
  userId: string;
  email: string;
  plan: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  stripeCustomerId?: string | null;
  stripeSessionId: string;
  webhookVerified: boolean;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      user_id: input.userId,
      email: input.email.toLowerCase(),
      plan: input.plan,
      payment_status: input.paymentStatus,
      stripe_customer_id: input.stripeCustomerId || null,
      stripe_session_id: input.stripeSessionId,
      webhook_verified: input.webhookVerified,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_session_id' }
  );

  if (error) {
    throw new Error(`Failed to save payment record: ${error.message}`);
  }
}

export async function unlockPremiumAccess(input: {
  userId: string;
  stripeCustomerId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  await supabase
    .from('users')
    .update({
      premium_unlocked: true,
      stripe_customer_id: input.stripeCustomerId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.userId);
}

export async function getActivePlanForUser(userId: string): Promise<ActivePlan | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('plan,payment_status,stripe_session_id,stripe_customer_id,updated_at')
    .eq('user_id', userId)
    .eq('payment_status', 'paid')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load active plan: ${error.message}`);
  }

  if (!data) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('premium_unlocked,stripe_customer_id,updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Failed to load active profile: ${profileError.message}`);
    }

    if (!profile?.premium_unlocked && !profile?.stripe_customer_id) {
      return null;
    }

    return {
      plan: AUDIT_REGENERATION_PLAN,
      paymentStatus: 'paid',
      stripeSessionId: null,
      stripeCustomerId: profile.stripe_customer_id || null,
      updatedAt: profile.updated_at,
    };
  }

  return {
    plan: data.plan,
    paymentStatus: 'paid',
    stripeSessionId: data.stripe_session_id,
    stripeCustomerId: data.stripe_customer_id || null,
    updatedAt: data.updated_at,
  };
}
