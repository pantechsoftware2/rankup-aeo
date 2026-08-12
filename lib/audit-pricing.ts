export const AUDIT_REGENERATION_PLAN = 'audit_regeneration';
export const AUDIT_REGENERATION_PRICE_INR = 1;
export const AUDIT_REGENERATION_AMOUNT_PAISE = AUDIT_REGENERATION_PRICE_INR * 100;
export const AUDIT_REGENERATION_CURRENCY = 'inr';

export function formatAuditRegenerationPrice() {
  return `Rs. ${AUDIT_REGENERATION_PRICE_INR}`;
}
