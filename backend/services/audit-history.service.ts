import 'server-only';

import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { crawlWebsite } from '@/lib/crawler';
import { performFastScan } from '@/lib/fast-scan';
import { performDeepScan } from '@/lib/deep-scan';
import type { DeepAuditReport } from '@/types/deep-audit';
import type { AuditHistoryInput, AuditHistoryRecord } from '@/backend/models/audit';
import { ensureProtocol, normalizeAuditDomain } from '@/backend/utils/domain';

const TABLE_NAME = 'audit_history';
const memoryAuditHistory: AuditHistoryRecord[] = [];
const LOCAL_STORAGE_ROOT =
  process.env.AUDIT_HISTORY_STORAGE_DIR?.trim() ||
  path.join(process.cwd(), '.audit-history');
const LOCAL_HISTORY_FILE = path.join(LOCAL_STORAGE_ROOT, 'history.json');

function shouldUseLocalFallback(error: unknown) {
  if (!(error instanceof Error)) {
    return true;
  }

  return (
    /fetch failed/i.test(error.message) ||
    /network/i.test(error.message) ||
    /ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(error.message)
  );
}

async function readLocalAuditHistory() {
  try {
    const raw = await readFile(LOCAL_HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AuditHistoryRecord[]) : [];
  } catch {
    return [...memoryAuditHistory];
  }
}

async function writeLocalAuditHistory(records: AuditHistoryRecord[]) {
  memoryAuditHistory.splice(0, memoryAuditHistory.length, ...records);
  try {
    await mkdir(LOCAL_STORAGE_ROOT, { recursive: true });
    await writeFile(LOCAL_HISTORY_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (error) {
    console.warn('[AuditHistory] Local file persistence unavailable; using memory fallback.', error);
  }
}

function toRow(input: AuditHistoryRecord) {
  return {
    id: input.id,
    user_id: input.userId || null,
    domain: input.domain,
    audit_version: input.auditVersion,
    generated_at: input.generatedAt,
    free_audit_used: input.freeAuditUsed,
    payment_status: input.paymentStatus,
    stripe_session_id: input.stripeSessionId || null,
    payment_intent: input.paymentIntent || null,
    amount_paid: input.amountPaid || null,
    customer_email: input.customerEmail || null,
    report_url: input.reportUrl || null,
    crawl: input.crawl || null,
    fast: input.fast || null,
    deep: input.deep || null,
  };
}

function fromRow(row: any): AuditHistoryRecord {
  return {
    id: row.id,
    userId: row.user_id,
    domain: row.domain,
    auditVersion: row.audit_version,
    generatedAt: row.generated_at,
    freeAuditUsed: row.free_audit_used,
    paymentStatus: row.payment_status,
    stripeSessionId: row.stripe_session_id,
    paymentIntent: row.payment_intent,
    amountPaid: row.amount_paid,
    customerEmail: row.customer_email,
    reportUrl: row.report_url,
    crawl: row.crawl,
    fast: row.fast,
    deep: row.deep,
  };
}

export async function hasUsedFreeAudit(domain: string) {
  const normalizedDomain = normalizeAuditDomain(domain);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('domain', normalizedDomain)
      .eq('free_audit_used', true)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check audit history: ${error.message}`);
    }

    return Boolean(data?.length);
    } catch (error) {
      if (!shouldUseLocalFallback(error)) {
        throw error;
      }
      console.warn('[AuditHistory] Supabase history check unavailable; falling back locally.', error);
    }
  }

  const localHistory = await readLocalAuditHistory();
  return localHistory.some((audit) => audit.domain === normalizedDomain && audit.freeAuditUsed);
}

export async function getNextAuditVersion(domain: string) {
  const normalizedDomain = normalizeAuditDomain(domain);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('audit_version')
      .eq('domain', normalizedDomain)
      .order('audit_version', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to read audit version: ${error.message}`);
    }

    return (data?.[0]?.audit_version || 0) + 1;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) {
        throw error;
      }
      console.warn('[AuditHistory] Supabase version lookup unavailable; falling back locally.', error);
    }
  }

  const localHistory = await readLocalAuditHistory();
  const latest = localHistory
    .filter((audit) => audit.domain === normalizedDomain)
    .reduce((max, audit) => Math.max(max, audit.auditVersion), 0);

  return latest + 1;
}

export async function createAuditHistory(input: AuditHistoryInput) {
  const domain = normalizeAuditDomain(input.domain);
  const auditVersion = await getNextAuditVersion(domain);
  const id = crypto.randomUUID();
  const generatedAt = input.generatedAt || new Date().toISOString();
  const reportUrl = input.reportUrl || `/report-preview?domain=${encodeURIComponent(domain)}&version=${auditVersion}`;
  const record: AuditHistoryRecord = {
    ...input,
    id,
    domain,
    auditVersion,
    generatedAt,
    reportUrl,
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
    const { error } = await supabase.from(TABLE_NAME).insert(toRow(record));
    if (error) {
      throw new Error(`Failed to save audit history: ${error.message}`);
    }
    return record;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) {
        throw error;
      }
      console.warn('[AuditHistory] Supabase history save unavailable; falling back locally.', error);
    }
  }

  const localHistory = await readLocalAuditHistory();
  await writeLocalAuditHistory([record, ...localHistory]);
  return record;
}

export async function getAuditByStripeSession(stripeSessionId: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load paid audit: ${error.message}`);
    }

    return data ? fromRow(data) : null;
    } catch (error) {
      if (!shouldUseLocalFallback(error)) {
        throw error;
      }
      console.warn('[AuditHistory] Supabase paid audit lookup unavailable; falling back locally.', error);
    }
  }

  const localHistory = await readLocalAuditHistory();
  return localHistory.find((audit) => audit.stripeSessionId === stripeSessionId) || null;
}

export async function runAuditPipelineAndStore(input: Omit<AuditHistoryInput, 'generatedAt' | 'crawl' | 'fast' | 'deep' | 'reportUrl'>) {
  const normalizedUrl = ensureProtocol(input.domain);
  const crawl = await crawlWebsite(normalizedUrl);
  const fastResult = await performFastScan(normalizedUrl, { crawlPayload: crawl });
  let deep: DeepAuditReport | null = null;

  if (fastResult.fast.readiness.recommendedPath !== 'foundation') {
    const deepResult = await performDeepScan(fastResult.crawl, fastResult.fast);
    if (deepResult.success && deepResult.report) {
      deep = deepResult.report;
    }
  }

  return createAuditHistory({
    ...input,
    domain: normalizedUrl,
    crawl: fastResult.crawl,
    fast: fastResult.fast,
    deep,
  });
}
