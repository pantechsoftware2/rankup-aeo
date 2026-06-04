import dns from 'node:dns/promises';
import net from 'node:net';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const BLOCKED_HOSTNAMES = new Set([
  '0.0.0.0',
  'localhost',
]);

const BLOCKED_SUFFIXES = [
  '.internal',
  '.local',
  '.localhost',
  '.test',
];

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;

  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fe90:') ||
    normalized.startsWith('fea0:') ||
    normalized.startsWith('feb0:')
  );
}

function isPrivateIpAddress(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (!lower.includes('.')) return true;

  return BLOCKED_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

export function normalizeAuditUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('URL is required');
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function validatePublicAuditUrl(input: string): Promise<string> {
  const normalizedUrl = normalizeAuditUrl(input);

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Authenticated URLs are not allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || isBlockedHostname(hostname)) {
    throw new Error('Private, local, or non-public hosts are not allowed');
  }

  const ipVersion = net.isIP(hostname);
  if (ipVersion !== 0) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error('Private IP addresses are not allowed');
    }
    return parsed.toString();
  }

  let resolved;
  try {
    resolved = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error('Could not resolve that hostname');
  }

  if (!resolved.length) {
    throw new Error('Could not resolve that hostname');
  }

  if (resolved.some((entry) => isPrivateIpAddress(entry.address))) {
    throw new Error('This host resolves to a private or local IP address');
  }

  return parsed.toString();
}

export function isUserUrlValidationError(message: string): boolean {
  return [
    'URL is required',
    'Invalid URL format',
    'Only http and https URLs are allowed',
    'Authenticated URLs are not allowed',
    'Private, local, or non-public hosts are not allowed',
    'Private IP addresses are not allowed',
    'This host resolves to a private or local IP address',
    'Could not resolve that hostname',
  ].includes(message);
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

export function applyRateLimit(
  req: Request,
  options: {
    key: string;
    limit: number;
    windowMs: number;
  }
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucketKey = `${options.key}:${ip}`;
  const existing = rateLimitStore.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: Math.max(0, options.limit - 1),
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  existing.count += 1;
  rateLimitStore.set(bucketKey, existing);

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    remaining: Math.max(0, options.limit - existing.count),
  };
}

export async function safeFetchWithRedirects(
  url: string,
  init: RequestInit = {},
  redirectsRemaining = 3
): Promise<Response> {
  const safeUrl = await validatePublicAuditUrl(url);
  const response = await fetch(safeUrl, {
    ...init,
    redirect: 'manual',
  });

  if (response.status >= 300 && response.status < 400) {
    if (redirectsRemaining <= 0) {
      throw new Error('Too many redirects while fetching URL');
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Redirect response missing location header');
    }

    const nextUrl = new URL(location, safeUrl).toString();
    return safeFetchWithRedirects(nextUrl, init, redirectsRemaining - 1);
  }

  return response;
}

export async function safeFetchText(url: string, init: RequestInit = {}): Promise<string> {
  const response = await safeFetchWithRedirects(url, init);
  return response.text();
}
