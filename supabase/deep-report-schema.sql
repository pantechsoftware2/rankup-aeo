create extension if not exists pgcrypto;

create table if not exists public.deep_report_jobs (
  id uuid primary key,
  status text not null,
  source text not null,
  website text not null,
  brand_name text not null,
  lead jsonb not null,
  notes text,
  error text,
  scorecard jsonb,
  evidence jsonb,
  report jsonb,
  sent_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists deep_report_jobs_status_created_at_idx
  on public.deep_report_jobs (status, created_at);

create table if not exists public.lead_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null,
  logged_at timestamptz not null default timezone('utc', now())
);

create index if not exists lead_logs_type_logged_at_idx
  on public.lead_logs (type, logged_at desc);

alter table public.deep_report_jobs enable row level security;
alter table public.lead_logs enable row level security;
