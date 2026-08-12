const CURRENT_SUPABASE_URL = 'https://vhimcwdandcfgwhjimvt.supabase.co';
const DEAD_SUPABASE_REFS = new Set(['rsinvxlbfixscjiscogd']);

function normalizeSupabaseUrl(rawUrl?: string) {
  const url = rawUrl?.trim();

  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url);
    const projectRef = parsed.hostname.split('.')[0];

    if (DEAD_SUPABASE_REFS.has(projectRef)) {
      return CURRENT_SUPABASE_URL;
    }

    return parsed.origin;
  } catch {
    return url;
  }
}

export function getSupabaseUrl() {
  const url =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    normalizeSupabaseUrl(process.env.SUPABASE_URL);

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }

  return url;
}

export function getSupabaseAnonKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();

  if (!key) {
    throw new Error('Supabase publishable key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_PUBLISHABLE_KEY.');
  }

  return key;
}

function getVercelOrigin() {
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (!vercelUrl) {
    return '';
  }

  return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
}

export function getSiteUrl(req?: Request) {
  const requestOrigin = req ? new URL(req.url).origin : '';

  if (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')) {
    return requestOrigin.replace(/\/$/, '');
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    getVercelOrigin() ||
    requestOrigin ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}
