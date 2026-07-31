import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const TABLE_NAME = 'payments';

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
