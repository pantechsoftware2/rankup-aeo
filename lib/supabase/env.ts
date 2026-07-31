export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim();

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
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    getVercelOrigin() ||
    (req ? new URL(req.url).origin : 'http://localhost:3000')
  ).replace(/\/$/, '');
}
