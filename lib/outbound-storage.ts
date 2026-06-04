import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { OutboundProspect, OutboundSegment } from '@/types/outbound';

const STORAGE_ROOT =
  process.env.OUTBOUND_STORAGE_DIR?.trim() || path.join(process.cwd(), '.outbound-prospects');
const TABLE_NAME = 'outbound_prospects';

type ProspectRow = {
  id: string;
  segment: OutboundProspect['segment'];
  status: OutboundProspect['status'];
  company_name: string;
  website: string;
  source_query: string;
  location: string | null;
  fit_score: number;
  weakness_score: number;
  opportunity_score: number;
  contact: OutboundProspect['contact'];
  evidence_summary: string;
  snapshot: OutboundProspect['snapshot'];
  created_at: string;
  updated_at: string;
};

function toRow(prospect: OutboundProspect): ProspectRow {
  return {
    id: prospect.id,
    segment: prospect.segment,
    status: prospect.status,
    company_name: prospect.companyName,
    website: prospect.website,
    source_query: prospect.sourceQuery,
    location: prospect.location ?? null,
    fit_score: prospect.fitScore,
    weakness_score: prospect.weaknessScore,
    opportunity_score: prospect.opportunityScore,
    contact: prospect.contact,
    evidence_summary: prospect.evidenceSummary,
    snapshot: prospect.snapshot,
    created_at: prospect.createdAt,
    updated_at: prospect.updatedAt,
  };
}

function fromRow(row: ProspectRow): OutboundProspect {
  return {
    id: row.id,
    segment: row.segment,
    status: row.status,
    companyName: row.company_name,
    website: row.website,
    sourceQuery: row.source_query,
    location: row.location ?? undefined,
    fitScore: row.fit_score,
    weaknessScore: row.weakness_score,
    opportunityScore: row.opportunity_score,
    contact: row.contact,
    evidenceSummary: row.evidence_summary,
    snapshot: row.snapshot,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isMissingTableError(message: string) {
  return message.includes('relation') && message.includes('does not exist');
}

function shouldUseFilesystemFallback() {
  return process.env.NODE_ENV !== 'production';
}

async function ensureDir() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
}

function filePathFor(id: string) {
  return path.join(STORAGE_ROOT, `${id}.json`);
}

async function listLocalProspects(): Promise<OutboundProspect[]> {
  await ensureDir();
  const files = await fs.readdir(STORAGE_ROOT);
  const prospects = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(STORAGE_ROOT, file), 'utf8');
        return JSON.parse(raw) as OutboundProspect;
      })
  );
  return prospects.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function upsertOutboundProspect(
  input: Omit<OutboundProspect, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
) {
  const existing = await findOutboundProspectByWebsite(input.website);
  const now = new Date().toISOString();
  const prospect: OutboundProspect = {
    ...input,
    id: existing?.id || input.id || crypto.randomUUID(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from(TABLE_NAME).upsert(toRow(prospect), {
      onConflict: 'website',
    });

    if (!error) {
      return prospect;
    }

    if (!isMissingTableError(error.message)) {
      throw new Error(`Supabase outbound prospect upsert failed: ${error.message}`);
    }

    if (!shouldUseFilesystemFallback()) {
      throw new Error(
        'Outbound prospect storage is not configured in production. Run supabase/outbound-schema.sql first.'
      );
    }
  }

  await ensureDir();
  await fs.writeFile(filePathFor(prospect.id), JSON.stringify(prospect, null, 2));
  return prospect;
}

export async function listOutboundProspects(filters?: {
  segment?: OutboundSegment;
  status?: OutboundProspect['status'];
  limit?: number;
}) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });

    if (filters?.segment) query = query.eq('segment', filters.segment);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (!error && data) {
      return data.map((row) => fromRow(row as ProspectRow));
    }
    if (!error) return [];
    if (!isMissingTableError(error.message)) {
      throw new Error(`Supabase outbound prospect list failed: ${error.message}`);
    }

    if (!shouldUseFilesystemFallback()) {
      throw new Error(
        'Outbound prospect storage is not configured in production. Run supabase/outbound-schema.sql first.'
      );
    }
  }

  const prospects = await listLocalProspects();
  return prospects
    .filter((prospect) => (filters?.segment ? prospect.segment === filters.segment : true))
    .filter((prospect) => (filters?.status ? prospect.status === filters.status : true))
    .slice(0, filters?.limit || prospects.length);
}

export async function findOutboundProspectByWebsite(website: string) {
  const normalized = website.trim().replace(/\/+$/, '');
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('website', normalized)
      .maybeSingle();

    if (!error && data) {
      return fromRow(data as ProspectRow);
    }

    if (error && !isMissingTableError(error.message)) {
      throw new Error(`Supabase outbound prospect lookup failed: ${error.message}`);
    }

    if (error && isMissingTableError(error.message) && !shouldUseFilesystemFallback()) {
      throw new Error(
        'Outbound prospect storage is not configured in production. Run supabase/outbound-schema.sql first.'
      );
    }
  }

  const prospects = await listLocalProspects();
  return prospects.find((prospect) => prospect.website.replace(/\/+$/, '') === normalized) || null;
}

export async function findOutboundProspectById(id: string) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return fromRow(data as ProspectRow);
    }

    if (error && !isMissingTableError(error.message)) {
      throw new Error(`Supabase outbound prospect lookup failed: ${error.message}`);
    }

    if (error && isMissingTableError(error.message) && !shouldUseFilesystemFallback()) {
      throw new Error(
        'Outbound prospect storage is not configured in production. Run supabase/outbound-schema.sql first.'
      );
    }
  }

  const prospects = await listLocalProspects();
  return prospects.find((prospect) => prospect.id === id) || null;
}
