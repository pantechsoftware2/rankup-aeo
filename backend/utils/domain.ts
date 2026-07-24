export function normalizeAuditDomain(input: string) {
  const value = input.trim();
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const parsed = new URL(withProtocol);
  return parsed.hostname.toLowerCase().replace(/^www\./, '');
}

export function ensureProtocol(input: string) {
  return /^https?:\/\//i.test(input) ? input : `https://${input}`;
}
