import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const STORAGE_ROOT = process.env.LEAD_LOG_STORAGE_DIR?.trim() || path.join(process.cwd(), '.lead-logs');
const LEAD_LOGS_TABLE = 'lead_logs';

export async function writeLeadLog(type: string, payload: Record<string, unknown>) {
  const entry = {
    type,
    loggedAt: new Date().toISOString(),
    ...payload,
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from(LEAD_LOGS_TABLE).insert({
      type,
      logged_at: entry.loggedAt,
      payload: entry,
    });

    if (error) {
      throw new Error(`Supabase lead log insert failed: ${error.message}`);
    }
    return;
  }

  await mkdir(STORAGE_ROOT, { recursive: true });
  const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}-${type}-${randomUUID()}.json`;
  await writeFile(
    path.join(STORAGE_ROOT, filename),
    JSON.stringify(entry, null, 2),
    'utf8'
  );
}
