# Production Deployment

This project deploys to Vercel as one Next.js App Router application.

## Architecture

- `app/api/*` contains every public API route.
- `backend/` contains controllers, services, models, middleware, config, and utilities only.
- There is no standalone Express server and no separate backend deployment.
- Vercel should use the repository root as the project root.

## Required Environment Variables

Frontend:

- `NEXT_PUBLIC_APP_URL` - production origin, for example `https://www.rankupaeo.com`.

Server:

- `OPENROUTER_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEP_REPORT_ADMIN_TOKEN`
- `SCRAPER_API_KEY`
- `SERPER_API_KEY`

Optional email/workflow variables used by intake and report delivery:

- `ADMIN_EMAIL`
- `FROM_EMAIL`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `EMAIL_PROVIDER`
- `GOOGLE_WORKSPACE_CLIENT_EMAIL`
- `GOOGLE_WORKSPACE_PRIVATE_KEY`
- `GOOGLE_WORKSPACE_IMPERSONATED_USER`

## Stripe

- Checkout is created through `app/api/payments/create-checkout-session`.
- Webhooks are received at `app/api/payments/webhook`.
- The webhook handler reads the raw request body with `req.text()`.
- `STRIPE_WEBHOOK_SECRET` is required.
- The Stripe signature and timestamp are verified before any payment processing.

## Vercel Settings

- Framework preset: Next.js.
- Build command: `npm run build`.
- Install command: `npm install`.
- Output directory: leave default.
- Root directory: repository root.
- Do not configure a separate backend service.

No `vercel.json` is required for this project.

## Pre-Deployment Checklist

- Set all required environment variables in Vercel Production and Preview.
- Confirm `NEXT_PUBLIC_APP_URL` matches the production domain.
- Confirm Stripe webhook endpoint points to `https://<domain>/api/payments/webhook`.
- Confirm Supabase table schemas from `supabase/*.sql` are applied.
- Confirm OpenRouter, Serper, and scraper API keys are active.
- Run `npm install`.
- Run `npm run lint`.
- Run `npm run build`.

## Post-Deployment Verification

- Visit `/` and confirm the page renders.
- Start a free audit from `/audit-flow`.
- Confirm `/report-preview?url=cal.com` progresses past audit-history checks.
- Confirm paid checkout opens from the payment flow.
- Send a Stripe test webhook event and confirm signature validation passes.
- Confirm `/api/auth/me` does not expose secret fields.
- Confirm no server secret appears in browser source, JS bundles, or network responses.
