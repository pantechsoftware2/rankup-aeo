# Initial baseline

Run: `RUN-2026-09-23-001`  
Playbook: `1.0`  
Observed: 2026-09-23

## Repository and build

- Next.js 14.2.35 App Router.
- `npm.cmd run lint`: passed with no warnings or errors.
- `npm.cmd run build`: passed; 57 static/dynamic routes generated.
- Public content inventory: 4 blog posts, 4 service pages, 4 industry pages.
- No Search Console, analytics, backlink, AI benchmark, or hosting datasets found.
- The repository link audit was attempted, but the existing local server on port 3000 was using a stale/corrupted development `.next` state after the build; dynamic routes returned 500 with a missing `@vercel` vendor chunk. This is an environment-contaminated test, not production evidence.

## Public evidence

- Homepage renders a clear offer, audit CTA, service/industry navigation, and direct answers.
- Public homepage content identifies RankUp AEO as an SEO/AEO visibility service and states the audit -> report -> strategy-call path.
- Source includes robots, sitemap, RSS, llms, and JSON-LD routes.

## Coverage limits

- Live shell requests failed in the restricted environment; web fetch verified the homepage but did not independently expose robots/sitemap responses.
- No authenticated production identity, deployment ID, rollback reference, field performance, index coverage, query/page data, conversion data, or AI sample results.
