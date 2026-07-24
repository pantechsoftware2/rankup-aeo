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

create table if not exists public.audit_users (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_history (
  id uuid primary key,
  user_id uuid references public.audit_users(id) on delete set null,
  domain text not null,
  audit_version integer not null,
  generated_at timestamptz not null default timezone('utc', now()),
  free_audit_used boolean not null default false,
  payment_status text not null default 'free',
  stripe_session_id text,
  payment_intent text,
  amount_paid integer,
  customer_email text,
  report_url text,
  crawl jsonb,
  fast jsonb,
  deep jsonb
);

create unique index if not exists audit_history_domain_version_idx
  on public.audit_history (domain, audit_version);

create index if not exists audit_history_domain_generated_at_idx
  on public.audit_history (domain, generated_at desc);

create index if not exists audit_history_user_generated_at_idx
  on public.audit_history (user_id, generated_at desc);

create index if not exists audit_history_stripe_session_idx
  on public.audit_history (stripe_session_id);

alter table public.deep_report_jobs enable row level security;
alter table public.lead_logs enable row level security;
alter table public.audit_users enable row level security;
alter table public.audit_history enable row level security;
