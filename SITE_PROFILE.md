# Site Profile

Generated: 2026-07-13

## 1. Rendering

- Stack: Next.js App Router.
- Evidence:
  - `package.json` uses `next` and scripts for `next dev`, `next build`, and `next start`.
  - `next.config.mjs` exports a Next config object.
  - Routes live under `app/`, with no `pages/` router found.
- Build verification:
  - `npm.cmd run build` completed successfully.
  - Build output generated 43 static pages.
  - `.next/server/app/index.html` contains rendered homepage body content, page metadata, and JSON-LD.
  - `.next/server/app/services/seo-aeo-agency.html` contains rendered service-page body content, page metadata, and JSON-LD.
  - `.next/server/app/blog/how-to-make-content-citeable-in-ai-search.html` contains rendered blog-post body content, page metadata, and JSON-LD.

Route rendering summary from the production build:

- Static/prerendered pages:
  - `/`
  - `/about`
  - `/audit-flow`
  - `/blog`
  - `/contact`
  - `/industries`
  - `/methodology`
  - `/onboarding`
  - `/services`
  - `/robots.txt`
  - `/sitemap.xml`
  - `/feed.xml`
  - `/llms.txt`
  - `/llms-full.txt`
- SSG dynamic content routes:
  - `/blog/[slug]` via `app/blog/[slug]/page.tsx`
  - `/services/[slug]` via `app/services/[slug]/page.tsx`
  - `/industries/[slug]` via `app/industries/[slug]/page.tsx`
- Server-rendered on demand:
  - `/report-preview` via `app/report-preview/page.tsx`
  - `/review` via `app/review/page.tsx`
  - `/review/[id]` via `app/review/[id]/page.tsx`
  - API routes under `app/api/**`
  - Dynamic image routes `app/opengraph-image.tsx`, `app/twitter-image.tsx`, and `app/og/default.png/route.tsx`

Conclusion: crawlers receive rendered HTML for the main public marketing, blog, service, and industry pages. This is not a client-only SPA.

## 2. Metadata And Head Management

- Metadata is handled with the Next.js Metadata API.
- Root metadata:
  - `app/layout.tsx` exports `metadata` from `getRootMetadata()`.
  - `lib/seo.ts` defines `getRootMetadata()`, `buildPageMetadata()`, canonical URLs, Open Graph defaults, Twitter card defaults, robots metadata, and default OG image handling.
- Page-level static metadata:
  - `app/page.tsx`
  - `app/about/page.tsx`
  - `app/audit-flow/page.tsx`
  - `app/blog/page.tsx`
  - `app/contact/page.tsx`
  - `app/industries/page.tsx`
  - `app/methodology/page.tsx`
  - `app/onboarding/page.tsx`
  - `app/report-preview/page.tsx`
  - `app/review/page.tsx`
  - `app/review/[id]/page.tsx`
  - `app/services/page.tsx`
- Dynamic metadata:
  - `app/blog/[slug]/page.tsx` uses `generateMetadata`.
  - `app/services/[slug]/page.tsx` uses `generateMetadata`.
  - `app/industries/[slug]/page.tsx` uses `generateMetadata`.
- No `react-helmet` or `react-helmet-async` usage was found.

## 3. Robots And Sitemap

- `robots.txt` is present as a generated Next Metadata Route:
  - `app/robots.ts`
  - It allows core crawlers and disallows API, review, report-preview, and onboarding paths.
  - It references `absoluteUrl('/sitemap.xml')`.
- `sitemap.xml` is present as a generated Next Metadata Route:
  - `app/sitemap.ts`
  - It includes static pages, blog posts from `lib/blog.ts`, and service/industry landing pages from `lib/landing-pages.ts`.
- No `next-sitemap` package or config was found.

## 4. Structured Data

Structured data is implemented as inline JSON-LD scripts.

- Sitewide JSON-LD:
  - `app/layout.tsx` injects Organization JSON-LD from `getOrganizationJsonLd()` in `lib/seo.ts`.
  - `app/layout.tsx` injects WebSite JSON-LD from `getWebsiteJsonLd()` in `lib/seo.ts`.
- Homepage JSON-LD:
  - `app/page.tsx` injects WebPage, Service, FAQPage, and BreadcrumbList JSON-LD.
- Service pages:
  - `app/services/page.tsx` injects ItemList and BreadcrumbList JSON-LD.
  - `app/services/[slug]/page.tsx` injects Service, FAQPage, and BreadcrumbList JSON-LD.
- Industry pages:
  - `app/industries/page.tsx` injects ItemList and BreadcrumbList JSON-LD.
  - `app/industries/[slug]/page.tsx` injects Service, FAQPage, and BreadcrumbList JSON-LD.
- Blog pages:
  - `app/blog/page.tsx` injects Blog and BreadcrumbList JSON-LD.
  - `app/blog/[slug]/page.tsx` injects Article and BreadcrumbList JSON-LD.
- Other informational pages:
  - `app/about/page.tsx` injects AboutPage and BreadcrumbList JSON-LD.
  - `app/contact/page.tsx` injects ContactPage and BreadcrumbList JSON-LD.
  - `app/methodology/page.tsx` injects WebPage and BreadcrumbList JSON-LD.

Core schema helper file:

- `lib/seo.ts`

## 5. Content System

- Content is hardcoded TypeScript/JSX, not MDX and not a CMS.
- Page templates live under `app/**/page.tsx`.
- Shared UI/content sections live in `components/`.
- Blog content lives in `lib/blog.ts` as typed arrays of posts, sections, sources, keywords, and dates.
- Service and industry landing-page content lives in `lib/landing-pages.ts` as typed arrays and depth objects.
- No MDX files or CMS integration files were found during the repo scan.

## 6. SEO Data Availability

- No Google Search Console or analytics export directory was found in the repo.
- No `/seo-data` directory was found.
- Analytics runtime integration exists through `components/VercelAnalytics.tsx`, but no exported query, click, ranking, crawl, or analytics data files are available for weekly data-driven SEO work.

## Build Status

- Command run: `npm.cmd run build`
- Result: passed.

