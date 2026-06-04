import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import type { DeepReportJobLead, DeepReportJobRecord, DeepReportJobStatus } from '@/types/report-job';
import type { ComprehensiveAuditReport } from '@/types/comprehensive-report';

const JOBS_DIR = path.join(os.tmpdir(), 'rankup-deep-report-jobs');

async function ensureJobsDir() {
  await fs.mkdir(JOBS_DIR, { recursive: true });
}

function getJobPath(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

export async function createDeepReportJob(lead: DeepReportJobLead): Promise<DeepReportJobRecord> {
  await ensureJobsDir();

  const now = new Date().toISOString();
  const record: DeepReportJobRecord = {
    id: crypto.randomUUID(),
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    lead,
  };

  await fs.writeFile(getJobPath(record.id), JSON.stringify(record, null, 2), 'utf8');
  return record;
}

export async function getDeepReportJob(id: string): Promise<DeepReportJobRecord | null> {
  try {
    const file = await fs.readFile(getJobPath(id), 'utf8');
    return JSON.parse(file) as DeepReportJobRecord;
  } catch {
    return null;
  }
}

export async function updateDeepReportJob(
  id: string,
  patch: Partial<Pick<DeepReportJobRecord, 'status' | 'report' | 'error' | 'deliveredAt'>>
): Promise<DeepReportJobRecord> {
  const existing = await getDeepReportJob(id);
  if (!existing) {
    throw new Error(`Report job ${id} not found`);
  }

  const updated: DeepReportJobRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(getJobPath(id), JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

export async function setDeepReportJobStatus(id: string, status: DeepReportJobStatus) {
  return updateDeepReportJob(id, { status });
}

export async function saveDeepReportJobReport(id: string, report: ComprehensiveAuditReport, status: DeepReportJobStatus) {
  return updateDeepReportJob(id, { report, status });
}
