export const AUDIT_REGENERATION_PLAN = 'audit_regeneration';
export const AUDIT_REGENERATION_PRICE = 10;
export const AUDIT_REGENERATION_AMOUNT_MINOR = AUDIT_REGENERATION_PRICE * 100;
export const AUDIT_REGENERATION_CURRENCY = 'usd';

export function formatAuditRegenerationPrice() {
  return `$${AUDIT_REGENERATION_PRICE}`;
}
