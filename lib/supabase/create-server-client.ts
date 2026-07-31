import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env';

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export type SupabaseCookieMethods = {
  getAll: () => { name: string; value: string }[] | null;
  setAll?: (cookiesToSet: CookieToSet[], headers: Record<string, string>) => void;
};

export function createSupabaseServerClient(cookieMethods: SupabaseCookieMethods) {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: cookieMethods,
  });
}
