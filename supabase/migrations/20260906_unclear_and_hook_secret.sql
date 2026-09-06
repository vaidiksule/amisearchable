-- Run in the Supabase SQL editor (existing projects).

alter table public.users
  add column if not exists hook_secret text;

create unique index if not exists users_hook_secret_uidx
  on public.users (hook_secret)
  where hook_secret is not null;

alter table public.checks drop constraint if exists checks_verdict_check;
alter table public.checks
  add constraint checks_verdict_check check (verdict in ('pass', 'fail', 'unclear'));
