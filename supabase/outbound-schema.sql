create extension if not exists pgcrypto;

create table if not exists public.outbound_prospects (
  id uuid primary key,
  segment text not null,
  status text not null,
  company_name text not null,
  website text not null unique,
  source_query text not null,
  location text,
  fit_score integer not null default 0,
  weakness_score integer not null default 0,
  opportunity_score integer not null default 0,
  contact jsonb not null,
  evidence_summary text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists outbound_prospects_segment_created_at_idx
  on public.outbound_prospects (segment, created_at desc);

create index if not exists outbound_prospects_status_created_at_idx
  on public.outbound_prospects (status, created_at desc);

alter table public.outbound_prospects enable row level security;
