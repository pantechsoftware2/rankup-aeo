# Supabase Setup

Use Supabase for durable deep-report jobs and lead logs in production.

## 1. Create the tables

Open the Supabase SQL editor and run:

[`supabase/deep-report-schema.sql`](/Users/namanpandey/Documents/Playground/rankup1/rankup-aeo/supabase/deep-report-schema.sql)

## 2. Add server env vars

Add these in Vercel:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEP_REPORT_ADMIN_TOKEN`
- `NEXT_PUBLIC_PAID_CALL_URL`

Optional local fallback:

- If `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing, the app falls back to local filesystem storage for jobs/logs.

## 3. Internal review URLs

Use the review token in internal links:

- `/review?token=YOUR_DEEP_REPORT_ADMIN_TOKEN`
- `/review/<job-id>?token=YOUR_DEEP_REPORT_ADMIN_TOKEN`

## 4. What Supabase stores

- `deep_report_jobs`
  - queued, processing, review-ready, sent report jobs
  - report payload, scorecard, evidence, lead details

- `lead_logs`
  - every project intake and deep-report request
  - source attribution for the funnel
