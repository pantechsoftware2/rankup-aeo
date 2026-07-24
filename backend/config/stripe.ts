export const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  return key;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }
  return secret;
}

export function getAppUrl() {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim().replace(/^/, 'https://')
  )?.replace(/\/$/, '');

  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured.');
  }

  return appUrl;
}
