import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const CURRENT_SUPABASE_URL = 'https://vhimcwdandcfgwhjimvt.supabase.co';
const DEAD_SUPABASE_REFS = new Set(['rsinvxlbfixscjiscogd']);

let cachedClient: SupabaseClient | null | undefined;

function getConfiguredSupabaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || '';

  if (!rawUrl) {
    return '';
  }

  try {
    const parsed = new URL(rawUrl);
    const projectRef = parsed.hostname.split('.')[0];
    return DEAD_SUPABASE_REFS.has(projectRef) ? CURRENT_SUPABASE_URL : parsed.origin;
  } catch {
    return rawUrl;
  }
}

export function getSupabaseAdmin() {
  const url = getConfiguredSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (cachedClient === undefined) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedClient;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseAdmin());
}
