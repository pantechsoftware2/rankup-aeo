# Weekly SEO Item 6: Data-Driven Action

Run date: 2026-07-13
Branch: `data-driven-action`

## Status

N/A for this week.

## Reason

No Google Search Console or analytics export was available in the repo at run time.
The required `/seo-data/` directory was not present at the project root, and no CSV
files were found elsewhere in the app repo.

## Requested Checks

- Pages ranking positions 5-15 for a query: not evaluated; export unavailable.
- Queries with impressions but no dedicated page: not evaluated; export unavailable.
- Pages with click decay vs prior period: not evaluated; export unavailable.

## Recommendations

Before the next weekly run, export Google Search Console Performance for the last
28 days with query and page dimensions, then place the CSV export in `/seo-data/`.
Once that file exists, rerun Item 6 and make the top three on-page fixes from the
data.
