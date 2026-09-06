-- Badge request telemetry: distinguish report self-views vs real embeds via referer.
create table if not exists public.badge_hits (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  referer text,
  user_agent text,
  hit_at timestamptz not null default now()
);

create index if not exists badge_hits_hit_at_idx
  on public.badge_hits (hit_at desc);

create index if not exists badge_hits_domain_hit_at_idx
  on public.badge_hits (domain, hit_at desc);

alter table public.badge_hits enable row level security;

-- No public policies: service role only (server-side inserts).
grant all on public.badge_hits to service_role;
