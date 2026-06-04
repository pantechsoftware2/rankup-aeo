export interface ContactConfig {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  openInNewTab: boolean;
}

export function getContactConfig(): ContactConfig {
  const demoUrl =
    process.env.NEXT_PUBLIC_PAID_CALL_URL?.trim() ||
    process.env.NEXT_PUBLIC_PAID_CAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_BOOK_DEMO_URL?.trim();
  const fallbackPath = '/audit-flow';

  return {
    primaryHref: demoUrl || fallbackPath,
    primaryLabel: demoUrl ? 'Reserve Paid Strategy Call' : 'Request Strategy Review',
    secondaryHref: fallbackPath,
    secondaryLabel: 'See Audit Flow',
    openInNewTab: Boolean(demoUrl),
  };
}
