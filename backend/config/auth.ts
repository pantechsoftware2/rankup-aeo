export const SESSION_COOKIE = 'rankup_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getSessionSecret() {
  return (
    process.env.AUTH_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'rankup-local-session-secret'
  );
}
