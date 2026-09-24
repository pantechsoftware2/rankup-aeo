# Measurement contract

Status: awaiting access, initialized 2026-09-23.

## Required inputs

- Google Search Console property for `https://www.rankupaeo.com`, with query-by-page exports for complete 28-day, preceding 28-day, 90-day, and year-earlier windows where available.
- Analytics property and conversion definitions for audit starts, report requests, strategy-call bookings, and qualified outcomes.
- Vercel project/deployment identity, production logs, and rollback reference.
- Optional AI benchmark access for comparable clean-session samples.

## Rules

- Preserve source exports and record timezone, property, country, device, search type, filters, retrieval date, and row limits.
- Do not join separate page and query totals as if they identify query/page pairs.
- Aggregate CTR is clicks divided by impressions; do not average row CTRs.
- Treat missing, sampled, thresholded, or unavailable values as unknown rather than zero.
- Separate implementation verified, search observed, AI observed, business observed, and attribution uncertain.

## Initial baseline

No authenticated search, analytics, AI benchmark, or hosting datasets were available in the repository or connected tools on 2026-09-23. No before/after outcome claim is made.
