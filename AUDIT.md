# RankupAEO audit engine: source audit and Digitamar integration guide

This document records the existing implementation inspected on 10 September 2026. It is documentation only: no Digitamar integration is installed. File paths below are relative to `rankup-aeo/` unless stated otherwise.

## 1. Existing applications

**RankupAEO:** Next.js 14 App Router, React 18, TypeScript, Cheerio, OpenRouter, Serper and optional ZenRows rendering. Audit history uses Supabase when available, with local file and memory fallbacks.

**Digitamar:** Located at `C:/Users/Admin/Desktop/digitomar/digitamar`. Uses Next.js 16.2.9, React 19, `src/`, Tailwind 4, GSAP and Lenis. Its homepage renders `GrowthNavbar`, `Hero`, `GrowthClosing` and other marketing sections. The navbar audit CTA links to the closing section; the closing audit button opens Calendly. Inspection found no existing audit backend in its source tree.

Digitamar's `AGENTS.md` requires reading its installed Next.js guides before implementation. Its homepage styling, typography, backgrounds, animation and layout should be preserved.

## 2. Actual free-audit pipeline

```text
User submits URL
  -> POST /api/analyze (optionally ?stream=true)
  -> In-memory request rate limit
  -> Public URL validation and DNS lookup
  -> Normalize domain, resolve current user and active plan
  -> Check whether the domain has used its free audit
  -> Crawl page
  -> Fast analysis
       - business classification
       - messaging clarity
       - deterministic technical score
       - competitor estimates
       - off-site brand presence
       - foundation / retainer readiness decision
  -> If foundation: save crawl and fast report; skip deep analysis
  -> Otherwise: run deep AI report
  -> Save audit history
  -> Return or stream results
```

The source free audit primarily inspects the submitted page and the origin's robots/sitemap URLs. It is not a complete multi-page SEO crawler.

### Entry points

| Source file | Responsibility |
| --- | --- |
| `app/api/analyze/route.ts` | Main orchestration, free-domain gate, JSON and streaming modes, history persistence |
| `app/api/analyze/fast/route.ts` | Direct fast-scan endpoint |
| `app/api/analyze/deep/route.ts` | Separate deep-analysis route |
| `app/api/generate-report/route.ts` | Requires URL and brand name; runs fast then deep and returns report plus raw scan results |
| `backend/services/audit-history.service.ts` | Free-use lookup, versioning, storage and paid-session lookup |
| `backend/utils/domain.ts` | Shared domain/protocol normalization |

The main endpoint accepts `{ "url": "https://example.com" }`.

Successful non-streaming results contain `success`, `crawl`, `fast`, `deep` and `timing.totalMs`. `deep` is null on the foundation path. Streaming emits newline-delimited JSON events with stages `crawl`, `fast`, `deep` and `complete`. The source labels this stream `text/event-stream`, although its payload is not standard SSE framing.

In streaming mode, deep-analysis failure emits a deep-stage error and preserves the fast result. In non-streaming mode, a failed required deep analysis returns an error.

## 3. Crawling and extracted evidence

`lib/smartScraper.ts` first attempts a direct fetch. If visible content is below 300 characters or looks like a JavaScript shell, it can use ZenRows with JavaScript rendering and premium proxy parameters.

Without a rendering key, it can return the original low-content HTML. If fetching fails entirely, the source can manufacture a limited-capture HTML page. That fallback must not be mistaken for evidence from the submitted website.

`lib/crawler.ts` parses HTML with Cheerio and returns the `types/crawl.ts` payload:

- Metadata: title, description, Open Graph fields, application name, canonical, robots meta, viewport and charset.
- Headings: H1, H2, H3, H1 count and multiple-H1 flag.
- Content: visible text length, word count, body excerpt and client-rendering detection.
- Technical evidence: JSON-LD/microdata schema types, Open Graph, Twitter cards, favicon, internal/external link counts and image-alt counts.
- Robots and sitemap: existence checks for `/robots.txt` and `/sitemap.xml`, with five-second checks and a GET fallback for some failed HEAD requests. Unavailable checks may return null.
- Eight issue flags: missing description, missing H1, multiple H1s, missing viewport, missing canonical, missing schema, low content and majority missing image alt text.
- Raw HTML excerpt, capped at 50,000 characters after fetching; body text is capped at 30,000 characters.

**Important distinction:** robots-file existence is not robots-rule enforcement. Link counts are not broken-link verification. A viewport check is not mobile-browser testing. The free pipeline does not provide measured Lighthouse/PageSpeed or standalone accessibility scores.

## 4. Fast analysis and scoring

`lib/fast-scan.ts` runs classification, clarity, technical scoring and competitor analysis concurrently, then assesses search presence and readiness. It reuses the prepared crawl in the streaming orchestrator.

### Technical score

The score starts at 100, applies these deductions, and is floored at zero:

| Finding | Deduction |
| --- | ---: |
| Missing schema markup | 15 |
| Missing meta description | 10 |
| Missing H1 or multiple H1s | 10 |
| Missing canonical | 5 |
| Missing viewport | 5 |
| More than half of images lack nonempty alt text | 10 |
| Missing robots.txt | 5 |
| Missing sitemap.xml | 5 |
| Fewer than 300 words | 10 |

Unknown robots/sitemap checks are not deducted as confirmed missing files.

### Other fast outputs

- **Classification:** industry, niche and confidence; AI failure falls back to metadata-derived classification.
- **Clarity:** score, what the business does, intended audience, critique and CSR flag. The source validates key response fields. Failure uses a page-structure heuristic based on headings, content length, description and vocabulary; its critique identifies that AI analysis was unavailable.
- **Competitors:** AI-named competitors with estimated visibility. Search-derived fallback candidates use a formula based on ordering and evidence weight. These numbers are estimates, not measured search rankings or visibility percentages.
- **Presence:** ghost-town, emerging, visible or unknown; includes signal type, source count, discussion count and summary. Serper performs branded review, alternative and category queries, with deduplication and relevance filtering.
- **Readiness:** foundation/retainer decision based on presence, content, clarity, technical foundations and CSR signals. The source skips the deep report on its foundation path.

Preserve these actual fields rather than inventing SEO, performance or accessibility scores that the engine does not calculate.

## 5. AI prompts and deep report

| File | Purpose |
| --- | --- |
| `lib/models.ts` | Model selection |
| `lib/openrouter.ts` | OpenRouter client, JSON output request, content extraction, JSON cleanup/parsing and retry behavior |
| `lib/fast-scan.ts` | Classification, clarity and competitor prompts |
| `lib/deep-scan.ts` | Deep system prompt, evidence snapshot, repair prompt, report normalization and fallback model |
| `lib/serper.ts` | Search queries, retries and deduplication |
| `types/fast-scan.ts`, `types/deep-audit.ts` | Frontend/report data shapes |

Configured source models are `openai/gpt-4.1-mini` for fast and deep analysis, and `qwen/qwen3-32b` as fallback. These are the inspected source settings, not a claim about current provider availability.

The deep prompt requests an overall score, executive summary and six dimensions:

1. Content-market fit.
2. Credibility.
3. Conversion architecture.
4. Technical SEO.
5. GEO readiness.
6. Competitive position.

Each dimension includes score, findings and verdict plus relevant fields such as template artifacts, typos, CTA count, missing schema, citation worthiness or content gaps. The report also contains priority actions with impact/effort/category and GEO recommendations with rationale.

The evidence snapshot includes metadata, headings, a content excerpt, technical signals, issues and fast-analysis results. Primary deep analysis uses temperature zero, a 1,000-token output limit and a 12-second request timeout. Repair uses the fast model; fallback uses a 1,200-token limit and an 18-second timeout. The OpenRouter client has additional empty-output retry behavior.

**Validation gap:** source normalization can substitute default scores and generic descriptions for missing fields. A future integration should validate required scores and report fields before display, returning an unavailable/partial report rather than presenting substituted values as measured findings. Preserve valid source prompts and scoring behavior; document any deliberate hardening changes.

## 6. Limits, storage and report delivery

The main endpoint limits streaming requests to eight and non-streaming requests to ten per ten minutes. Fast-only requests allow fifteen per ten minutes; report generation allows six. Limits are held in process memory and identify callers using forwarded IP headers.

The main route checks free usage by normalized domain, not simply by email or browser session. Without an active paid plan, a previously used domain produces a `requiresPayment` response using the source pricing configuration.

Audit history uses the Supabase `audit_history` table. Records include domain, version, timestamp, free-use flag, payment metadata, crawl, fast/deep results and report URL. When Supabase is absent or selected failures occur, the source falls back to `.audit-history/history.json`, then memory if file persistence fails. This is not an atomic distributed quota system.

`components/ResultDashboard.tsx` and related scan/report components consume results. `lib/export-pdf.ts` uses browser print-to-PDF. Its share helper constructs a report-preview URL and uses native sharing or clipboard fallback.

### Separate consulting-report workflow

`app/api/deep-report/request/route.ts` accepts lead details and queues a separate report. `lib/deep-report-processor.ts` invokes consulting-report generation, changes job states to processing/awaiting-review/failed, and notifies the reviewer. Related modules cover jobs, research, storage, PDF/report assembly and delivery.

This queued, human-reviewed consulting report is distinct from the free crawl/fast/deep endpoint. Porting it would additionally require its lead inputs, queue processing, database schema, reviewer authentication, delivery configuration and UI. It must not be silently replaced with the free report or claimed as migrated without implementation and testing.

## 7. Environment configuration

Only variable names were recorded here; no credentials are included.

| Variable | Source use |
| --- | --- |
| `OPENROUTER_API_KEY` | Server-side AI calls |
| `SERPER_API_KEY` | Brand presence and competitor search |
| `SCRAPER_API_KEY` | Optional ZenRows rendering used by smartScraper |
| `NEXT_PUBLIC_APP_URL` | Application URL and OpenRouter referer; not a secret |
| `AUDIT_HISTORY_STORAGE_DIR` | Override local audit-history directory |
| `DEBUG_LOGS` | Enables source development debug logs |

Supabase-backed history and the source authentication/payment gate additionally depend on their shared Supabase and Stripe configuration. Environment names present in the source environment include `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, public publishable/anonymous keys and Stripe keys. Select the exact dependencies for the workflow being ported; do not copy every environment value.

The environment also contains `ZENROWS_API_KEY` and `GEMINI_API_KEY`, but the inspected free smart-scraper reads `SCRAPER_API_KEY`, and the inspected free AI pipeline calls OpenRouter. Their presence alone does not make them free-audit dependencies.

The separate consulting-report workflow has additional Brevo, sender/admin email, review/processor secrets and report-storage configuration. Keep that setup separate if the queued workflow is included.

Any future `.env.example` should contain placeholders only. Private keys must remain server-side and must never use a `NEXT_PUBLIC_` prefix.

## 8. Security and reliability findings

These are findings about the inspected source, not fixes already applied:

- URL validation checks HTTP/HTTPS, embedded credentials, blocked hostnames and DNS-resolved private addresses.
- Redirect fetching revalidates redirect destinations and defaults to three redirects.
- DNS validation is separate from connection resolution, leaving a potential DNS-rebinding gap. Pin checked addresses for actual connections.
- IP filtering needs comprehensive reserved-address and IPv4-mapped IPv6 coverage.
- Response-size limits must apply while downloading, not only when truncating the parsed report.
- Direct scraping lacks a consistent whole-operation timeout. Some provider timers stop after headers arrive; body reads and retries need bounded cancellation too.
- Robots existence checks do not enforce crawl restrictions.
- Fabricated fallback HTML can contaminate results after fetch failure. Report the failure rather than scoring that HTML.
- Some route errors return underlying exception messages. Map failures to safe public messages instead of exposing provider responses or internal details.
- Defaulted AI report scores can make malformed output look valid. Validate structured output before display.
- Rate-limit storage is process-local; forwarded headers require a trusted proxy configuration.
- Free-use checking and history writes are not atomic. Concurrent requests can bypass the intended single-use gate.
- Production local-file/memory fallbacks do not provide reliable persistence across serverless instances.
- Third-party rendering follows the provider's network behavior; local URL validation alone does not control its redirects or browser subrequests.

## 9. Proposed Digitamar integration architecture

This is a future implementation plan only.

```text
src/audit/
  api/          request orchestration and safe error responses
  components/   URL form, real progress and Digitamar report
  services/     crawl, fast/deep analysis and history adapters
  lib/          provider clients, fetching and security
  prompts/      source prompts and repair instructions
  types/        crawl, fast/deep and stream contracts
  utils/        shared URL normalization
  config/       audit configuration and optional database setup
  README.md     operational documentation

src/app/audit/page.tsx       thin page registration
src/app/api/audit/route.ts   thin server endpoint registration
```

A dedicated audit page fits the existing app and avoids changing the homepage layout. Connect desktop/mobile navbar audit CTAs and the closing audit CTA to that route; preserve booking actions. Use Digitamar's existing dark background, purple gradient, rounded buttons and fonts.

The form should normalize URLs, validate input, prevent duplicate submission, show actual backend stages, support keyboard/mobile use and handle incomplete streams. Reports should distinguish observed checks, heuristics and AI estimates. Do not use timer-driven fake progress or add unsupported metrics.

## 10. Verification checklist for a future implementation

- Compare source and migrated prompts, deterministic deductions, readiness branching and report fields.
- Verify public URL success and invalid/credentialed/non-HTTP input rejection.
- Test loopback, private/reserved IPs, mapped IPv6, mixed DNS answers, DNS rebinding and redirects into private addresses.
- Test robots restrictions, unavailable sites, TLS/DNS failures, oversized responses, redirect loops, empty pages and JavaScript shells.
- Test provider timeout, rate limiting, missing configuration, malformed/truncated JSON, repair/fallback and partial-report behavior.
- Test duplicate/concurrent requests, domain quota persistence and storage failure across deployment instances.
- Verify streamed stages correspond to completed or active server work and disconnects cancel work.
- Verify no API secrets, raw provider errors or executable crawled HTML reach the browser.
- Check report export, keyboard focus, mobile layouts, Safari/Chrome and existing homepage appearance.
- Run build/type checks and document which live provider and browser scenarios were actually tested.

No migrated implementation, build, browser or live-provider tests are claimed by this document. The attempted staging work was removed at the user's request; the intended deliverable is this Markdown file only.
