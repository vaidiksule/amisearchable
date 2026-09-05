-- Run this in the Supabase SQL editor once.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  polar_customer_id text unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  hostname text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.checks (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains (id) on delete cascade,
  checked_at timestamptz not null default now(),
  results jsonb not null,
  verdict text not null check (verdict in ('pass', 'fail')),
  llms_txt_present boolean not null,
  robots_txt_found boolean not null
);

create index if not exists checks_domain_checked_at_idx
  on public.checks (domain_id, checked_at desc);

create table if not exists public.monitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  domain_id uuid not null references public.domains (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, domain_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.domains enable row level security;
alter table public.checks enable row level security;
alter table public.monitors enable row level security;

drop policy if exists "public read domains" on public.domains;
create policy "public read domains" on public.domains for select using (true);

drop policy if exists "public read checks" on public.checks;
create policy "public read checks" on public.checks for select using (true);

drop policy if exists "users read self" on public.users;
create policy "users read self" on public.users for select using (auth.uid() = id);

drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users for update using (auth.uid() = id);

drop policy if exists "monitors read own" on public.monitors;
create policy "monitors read own" on public.monitors for select using (auth.uid() = user_id);

drop policy if exists "monitors write own" on public.monitors;
create policy "monitors write own" on public.monitors for all using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated, service_role;

grant select on public.domains to anon, authenticated;
grant select on public.checks to anon, authenticated;
grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.monitors to authenticated;

grant all on public.users to service_role;
grant all on public.domains to service_role;
grant all on public.checks to service_role;
grant all on public.monitors to service_role;
