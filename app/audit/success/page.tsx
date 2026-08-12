import { redirect } from 'next/navigation';

export default function AuditPaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id || '';

  redirect(sessionId ? `/?payment=success&session_id=${encodeURIComponent(sessionId)}` : '/?payment=success');
}
