import fs from 'node:fs/promises';
import path from 'node:path';
import { getDeepReportConfig, getDeepReportEvidencePath, getDeepReportJobPath, getDeepReportPdfPath } from './config';
import type { DeepReportJobRecord } from './types';

async function ensureDirectory(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function ensureDeepReportStorage() {
  const { dataRoot } = getDeepReportConfig();
  await fs.mkdir(path.join(dataRoot, 'jobs'), { recursive: true });
  await fs.mkdir(path.join(dataRoot, 'pdfs'), { recursive: true });
  await fs.mkdir(path.join(dataRoot, 'evidence'), { recursive: true });
}

export async function saveDeepReportJob(job: DeepReportJobRecord) {
  const filePath = getDeepReportJobPath(job.id);
  await ensureDirectory(filePath);
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(job, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
  return job;
}

export async function loadDeepReportJob(jobId: string): Promise<DeepReportJobRecord | null> {
  const filePath = getDeepReportJobPath(jobId);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as DeepReportJobRecord;
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function listDeepReportJobs(): Promise<DeepReportJobRecord[]> {
  const { dataRoot } = getDeepReportConfig();
  const jobsDir = path.join(dataRoot, 'jobs');

  try {
    const entries = await fs.readdir(jobsDir);
    const jobs = await Promise.all(
      entries
        .filter((entry) => entry.endsWith('.json'))
        .map(async (entry) => {
          const raw = await fs.readFile(path.join(jobsDir, entry), 'utf8');
          return JSON.parse(raw) as DeepReportJobRecord;
        })
    );

    return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function updateDeepReportJob(
  jobId: string,
  updater: (job: DeepReportJobRecord) => DeepReportJobRecord
) {
  const current = await loadDeepReportJob(jobId);
  if (!current) {
    throw new Error(`Deep report job not found: ${jobId}`);
  }

  const next = updater(current);
  await saveDeepReportJob(next);
  return next;
}

export async function saveDeepReportEvidence(jobId: string, evidence: unknown) {
  const filePath = getDeepReportEvidencePath(jobId);
  await ensureDirectory(filePath);
  await fs.writeFile(filePath, JSON.stringify(evidence, null, 2), 'utf8');
  return filePath;
}

export async function saveDeepReportPdf(jobId: string, pdfBuffer: Buffer) {
  const filePath = getDeepReportPdfPath(jobId);
  await ensureDirectory(filePath);
  await fs.writeFile(filePath, pdfBuffer);
  return filePath;
}

export async function loadDeepReportPdf(jobId: string) {
  const filePath = getDeepReportPdfPath(jobId);
  try {
    return await fs.readFile(filePath);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

