import AuthPageClient from '@/components/AuthPageClient';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return <AuthPageClient initialMode="login" initialError={searchParams.error || ''} nextPath={searchParams.next || '/dashboard'} />;
}
