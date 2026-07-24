import 'server-only';

import { getCurrentAuditUser } from '@/backend/services/auth.service';

export async function requireAuditUser() {
  const user = await getCurrentAuditUser();
  if (!user) {
    throw new Error('Authentication required.');
  }
  return user;
}
