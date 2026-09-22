-- Production-ready KaziLink tables for Supabase
-- Run this migration in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'client' check (role in ('client', 'freelancer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  category text not null default 'General',
  budget text not null default 'KSh 10,000',
  location text not null default 'Nairobi',
  type text not null default 'Remote',
  description text not null default 'Project description pending.',
  deadline text not null default '7 days',
  applicants integer not null default 0,
  details text not null default 'Client is looking for a reliable professional.',
  posted text not null default 'Just now',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_client_id
  on public.jobs (client_id);

create index if not exists idx_jobs_category
  on public.jobs (category);

create index if not exists idx_jobs_location
  on public.jobs (location);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_users_updated_at
before update on public.users
for each row execute procedure public.handle_updated_at();

create trigger handle_jobs_updated_at
before update on public.jobs
for each row execute procedure public.handle_updated_at();
