import { spawn, spawnSync } from 'node:child_process';
import * as cheerio from 'cheerio';

const PORT = Number(process.env.CRAWL_PORT || 4305);
const BASE = `http://localhost:${PORT}`;
const INTERNAL_HOSTS = new Set(['localhost', '127.0.0.1', 'www.rankupaeo.com', 'rankupaeo.com']);
const MAX_REDIRECTS = 10;
const MAX_PAGES = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toLocalUrl(href, fromPath = '/') {
  if (!href || href.startsWith('#')) return null;
  if (/^(mailto|tel|javascript):/i.test(href)) return null;

  const from = new URL(fromPath, BASE);
  const url = new URL(href, from);

  if (!INTERNAL_HOSTS.has(url.hostname)) return null;

  url.protocol = 'http:';
  url.hostname = 'localhost';
  url.port = String(PORT);
  url.hash = '';

  return url;
}

function pathKey(url) {
  return `${url.pathname}${url.search}`;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(BASE, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      await sleep(250);
    }
  }

  throw new Error(`Server did not become ready at ${BASE}`);
}

async function getSitemapSeeds() {
  const response = await fetch(`${BASE}/sitemap.xml`);
  const xml = await response.text();
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches
    .map((match) => toLocalUrl(match[1]))
    .filter(Boolean)
    .map(pathKey);
}

async function trace(url) {
  const chain = [];
  let current = url;

  for (let step = 0; step <= MAX_REDIRECTS; step += 1) {
    const response = await fetch(current, { redirect: 'manual' });
    chain.push({
      path: pathKey(current),
      status: response.status,
      location: response.headers.get('location'),
      contentType: response.headers.get('content-type') || '',
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, chain, loop: false, exceeded: false };
    }

    const location = response.headers.get('location');
    if (!location) {
      return { response, chain, loop: false, exceeded: false };
    }

    const next = toLocalUrl(location, pathKey(current));
    if (!next) {
      return { response, chain, loop: false, exceeded: false };
    }

    if (chain.some((entry) => entry.path === pathKey(next))) {
      chain.push({ path: pathKey(next), status: 'loop', location: null, contentType: '' });
      return { response, chain, loop: true, exceeded: false };
    }

    current = next;
  }

  return { response: null, chain, loop: false, exceeded: true };
}

async function crawl() {
  const server = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'start', '--', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  const logs = [];
  server.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  server.stderr.on('data', (chunk) => logs.push(chunk.toString()));

  try {
    await waitForServer();

    const queue = new Set(['/', ...(await getSitemapSeeds())]);
    const visited = new Set();
    const broken = [];
    const chains = [];
    const loops = [];

    while (queue.size > 0 && visited.size < MAX_PAGES) {
      const [currentPath] = queue;
      queue.delete(currentPath);
      if (visited.has(currentPath)) continue;
      visited.add(currentPath);

      const currentUrl = new URL(currentPath, BASE);
      const { response } = await trace(currentUrl);
      if (!response || response.status >= 400) continue;

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      const links = $('a[href]')
        .map((_, element) => $(element).attr('href'))
        .get();

      for (const href of links) {
        const linkUrl = toLocalUrl(href, currentPath);
        if (!linkUrl) continue;

        const result = await trace(linkUrl);
        const final = result.chain.at(-1);

        if (result.loop || result.exceeded) {
          loops.push({ source: currentPath, href, chain: result.chain });
          continue;
        }

        const redirectCount = result.chain.length - 1;
        if (redirectCount > 1) {
          chains.push({ source: currentPath, href, chain: result.chain });
        }

        if (final.status === 404) {
          broken.push({ source: currentPath, href, final: final.path });
          continue;
        }

        if (
          Number(final.status) < 400 &&
          (final.contentType || '').includes('text/html') &&
          !visited.has(final.path)
        ) {
          queue.add(final.path);
        }
      }
    }

    const report = { visited: [...visited].sort(), broken, chains, loops };
    console.log(JSON.stringify(report, null, 2));

    if (broken.length || chains.length || loops.length) {
      process.exitCode = 1;
    }
  } finally {
    if (process.platform === 'win32' && server.pid) {
      spawnSync('taskkill.exe', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      server.kill();
    }
    if (process.exitCode && logs.length) {
      console.error(logs.join(''));
    }
  }
}

crawl()
  .then(() => {
    process.exit(process.exitCode || 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
