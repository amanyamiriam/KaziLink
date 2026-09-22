-- Exact Supabase RLS policies for KaziLink
-- Run this after the tables are created.

alter table public.users enable row level security;
alter table public.jobs enable row level security;

create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Users can create their own profile"
on public.users
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can read jobs"
on public.jobs
for select
using (true);

create policy "Authenticated users can create jobs"
on public.jobs
for insert
with check (auth.uid() = client_id);

create policy "Clients can update their own jobs"
on public.jobs
for update
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

create policy "Clients can delete their own jobs"
on public.jobs
for delete
using (auth.uid() = client_id);

-- If you want to allow a client to see all jobs while still keeping public access,
-- keep the public read policy above. If you later want a stricter setup, replace it with:
-- create policy "Authenticated users can read jobs"
-- on public.jobs
-- for select
-- using (auth.role() = 'authenticated');
