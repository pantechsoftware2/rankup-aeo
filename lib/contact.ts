export interface ContactConfig {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  openInNewTab: boolean;
}

export function getContactConfig(): ContactConfig {
  const fallbackPath = '/audit-flow';

  return {
    primaryHref: fallbackPath,
    primaryLabel: 'Request Strategy Review',
    secondaryHref: fallbackPath,
    secondaryLabel: 'See Audit Flow',
    openInNewTab: false,
  };
}
