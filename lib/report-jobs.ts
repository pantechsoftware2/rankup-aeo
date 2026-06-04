import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { DeepReportJob, ReportJobStatus } from '@/types/consulting-report';

const STORAGE_ROOT = process.env.REPORT_JOB_STORAGE_DIR?.trim() || path.join(process.cwd(), '.report-jobs');
const JOBS_TABLE = 'deep_report_jobs';

function getJobFilePath(id: string) {
  return path.join(STORAGE_ROOT, `${id}.json`);
}

async function ensureStorageDir() {
  await mkdir(STORAGE_ROOT, { recursive: true });
}

type DeepReportJobRow = {
  id: string;
  status: ReportJobStatus;
  source: DeepReportJob['source'];
  website: string;
  brand_name: string;
  lead: DeepReportJob['lead'];
  notes: string | null;
  error: string | null;
  scorecard: DeepReportJob['scorecard'] | null;
  evidence: DeepReportJob['evidence'] | null;
  report: DeepReportJob['report'] | null;
  sent_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

function fromRow(row: DeepReportJobRow): DeepReportJob {
  return {
    id: row.id,
    status: row.status,
    source: row.source,
    website: row.website,
    brandName: row.brand_name,
    lead: row.lead,
    notes: row.notes || undefined,
    error: row.error || undefined,
    scorecard: row.scorecard || undefined,
    evidence: row.evidence || undefined,
    report: row.report || undefined,
    sentAt: row.sent_at || undefined,
    approvedAt: row.approved_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(job: DeepReportJob): DeepReportJobRow {
  return {
    id: job.id,
    status: job.status,
    source: job.source,
    website: job.website,
    brand_name: job.brandName,
    lead: job.lead,
    notes: job.notes || null,
    error: job.error || null,
    scorecard: job.scorecard || null,
    evidence: job.evidence || null,
    report: job.report || null,
    sent_at: job.sentAt || null,
    approved_at: job.approvedAt || null,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

export async function createDeepReportJob(input: Omit<DeepReportJob, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const now = new Date().toISOString();
  const job: DeepReportJob = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: 'queued',
    ...input,
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from(JOBS_TABLE).insert(toRow(job));
    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
    return job;
  }

  await ensureStorageDir();
  await writeFile(getJobFilePath(job.id), JSON.stringify(job, null, 2), 'utf8');
  return job;
}

export async function getDeepReportJob(id: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from(JOBS_TABLE).select('*').eq('id', id).maybeSingle<DeepReportJobRow>();
    if (error) {
      throw new Error(`Supabase read failed: ${error.message}`);
    }
    if (!data) {
      throw new Error(`Deep report job ${id} not found`);
    }
    return fromRow(data);
  }

  const raw = await readFile(getJobFilePath(id), 'utf8');
  return JSON.parse(raw) as DeepReportJob;
}

export async function updateDeepReportJob(id: string, updater: (current: DeepReportJob) => DeepReportJob) {
  const current = await getDeepReportJob(id);
  const next = updater(current);
  next.updatedAt = new Date().toISOString();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from(JOBS_TABLE).update(toRow(next)).eq('id', id);
    if (error) {
      throw new Error(`Supabase update failed: ${error.message}`);
    }
    return next;
  }

  await ensureStorageDir();
  await writeFile(getJobFilePath(id), JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export async function listDeepReportJobs(status?: ReportJobStatus) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase.from(JOBS_TABLE).select('*').order('created_at', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Supabase list failed: ${error.message}`);
    }

    return (data || []).map((row) => fromRow(row as DeepReportJobRow));
  }

  await ensureStorageDir();
  const entries = await readdir(STORAGE_ROOT);
  const jobs = await Promise.all(
    entries
      .filter((entry) => entry.endsWith('.json'))
      .map(async (entry) => JSON.parse(await readFile(path.join(STORAGE_ROOT, entry), 'utf8')) as DeepReportJob)
  );

  return jobs
    .filter((job) => (status ? job.status === status : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findNextQueuedJob() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from(JOBS_TABLE)
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<DeepReportJobRow>();

    if (error) {
      throw new Error(`Supabase queue read failed: ${error.message}`);
    }

    return data ? fromRow(data) : null;
  }

  const queued = await listDeepReportJobs('queued');
  return queued.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] || null;
}
