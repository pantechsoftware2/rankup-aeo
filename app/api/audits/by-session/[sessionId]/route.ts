import { getAuditBySession } from '@/backend/controllers/audit.controller';

export async function GET(_: Request, { params }: { params: { sessionId: string } }) {
  return getAuditBySession(params.sessionId);
}
