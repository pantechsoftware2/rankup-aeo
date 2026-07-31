import AuthPageClient from '@/components/AuthPageClient';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return <AuthPageClient initialMode="signup" nextPath={searchParams.next || '/dashboard'} />;
}
