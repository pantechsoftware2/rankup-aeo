import type { Metadata } from 'next';
import OnboardingPageClient from '@/components/OnboardingPageClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Strategy Intake',
  description: 'Internal conversion page for clients requesting implementation help after their audit.',
  path: '/onboarding',
  noIndex: true,
});

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
