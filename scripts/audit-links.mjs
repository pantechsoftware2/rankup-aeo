import * as cheerio from 'cheerio';

const baseUrl = process.argv[2] ?? 'http://localhost:3000';
const origin = new URL(baseUrl).origin;
const crawlQueue = [new URL('/', origin).href];
const crawled = new Set();
const seenLinks = new Map();
const results = new Map();
const maxPages = 250;
const maxRedirects = 8;

function normalizeUrl(rawUrl, sourceUrl) {
  let url;

  try {
    url = new URL(rawUrl, sourceUrl);
  } catch {
    return null;
  }

  if (url.origin !== origin) {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return null;
  }

  url.hash = '';

  return url.href;
}

function pathFor(url) {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}`;
}

async function checkUrl(url) {
  const visited = [];
  let currentUrl = url;

  for (let i = 0; i <= maxRedirects; i += 1) {
    const response = await fetch(currentUrl, { redirect: 'manual' });
    const status = response.status;
    const contentType = response.headers.get('content-type') ?? '';

    visited.push({ url: currentUrl, status });

    if (status >= 300 && status < 400) {
      const location = response.headers.get('location');

      if (!location) {
        return { finalStatus: status, chain: visited, contentType };
      }

      const nextUrl = normalizeUrl(location, currentUrl);

      if (!nextUrl) {
        return { finalStatus: status, chain: visited, contentType };
      }

      if (visited.some((entry) => entry.url === nextUrl)) {
        visited.push({ url: nextUrl, status: 'loop' });
        return { finalStatus: 'loop', chain: visited, contentType };
      }

      currentUrl = nextUrl;
      continue;
    }

    return { finalStatus: status, chain: visited, contentType };
  }

  return { finalStatus: 'too-many-redirects', chain: visited, contentType: '' };
}

function rememberLink(sourceUrl, targetUrl) {
  if (!seenLinks.has(targetUrl)) {
    seenLinks.set(targetUrl, new Set());
  }

  seenLinks.get(targetUrl).add(pathFor(sourceUrl));
}

async function seedSitemapUrls() {
  const sitemapUrl = new URL('/sitemap.xml', origin).href;

  try {
    const response = await fetch(sitemapUrl);

    if (!response.ok) {
      return;
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    $('loc').each((_, loc) => {
      const targetUrl = normalizeUrl($(loc).text(), sitemapUrl);

      if (targetUrl && !crawlQueue.includes(targetUrl)) {
        crawlQueue.push(targetUrl);
      }
    });
  } catch {
    // The anchor crawl still runs if the sitemap route is unavailable.
  }
}

await seedSitemapUrls();

while (crawlQueue.length > 0 && crawled.size < maxPages) {
  const url = crawlQueue.shift();

  if (!url || crawled.has(url)) {
    continue;
  }

  crawled.add(url);

  const result = await checkUrl(url);
  results.set(url, result);

  if (typeof result.finalStatus !== 'number' || result.finalStatus >= 400) {
    continue;
  }

  if (!result.contentType.includes('text/html')) {
    continue;
  }

  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  $('a[href]').each((_, anchor) => {
    const href = $(anchor).attr('href');
    const targetUrl = href ? normalizeUrl(href, url) : null;

    if (!targetUrl) {
      return;
    }

    rememberLink(url, targetUrl);

    if (!crawled.has(targetUrl) && !crawlQueue.includes(targetUrl)) {
      crawlQueue.push(targetUrl);
    }
  });
}

for (const url of seenLinks.keys()) {
  if (!results.has(url)) {
    results.set(url, await checkUrl(url));
  }
}

const broken = [];
const redirectChains = [];
const redirectLoops = [];

for (const [url, result] of results) {
  const chainLength = result.chain.length;
  const sources = [...(seenLinks.get(url) ?? new Set())].sort();

  if (result.finalStatus === 'loop') {
    redirectLoops.push({ url: pathFor(url), chain: result.chain.map((entry) => `${pathFor(entry.url)} ${entry.status}`), sources });
    continue;
  }

  if (typeof result.finalStatus === 'number' && result.finalStatus >= 400) {
    broken.push({ url: pathFor(url), status: result.finalStatus, sources });
  }

  if (chainLength > 2) {
    redirectChains.push({
      url: pathFor(url),
      chain: result.chain.map((entry) => `${pathFor(entry.url)} ${entry.status}`),
      sources,
    });
  }
}

const report = {
  baseUrl: origin,
  crawledPages: crawled.size,
  checkedUrls: results.size,
  broken,
  redirectChains,
  redirectLoops,
};

console.log(JSON.stringify(report, null, 2));

if (broken.length > 0 || redirectChains.length > 0 || redirectLoops.length > 0) {
  process.exitCode = 1;
}
