-- Citation probe results (latest per domain + engine).

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains (id) on delete cascade,
  engine text not null check (engine in ('chatgpt', 'claude', 'perplexity', 'gemini')),
  probes int not null default 0,
  hits int not null default 0,
  probed_at timestamptz not null default now(),
  matched_urls jsonb not null default '[]'::jsonb,
  error text,
  unique (domain_id, engine)
);

create index if not exists citations_domain_probed_at_idx
  on public.citations (domain_id, probed_at desc);

alter table public.citations enable row level security;

drop policy if exists "public read citations" on public.citations;
create policy "public read citations" on public.citations for select using (true);

grant select on public.citations to anon, authenticated;
grant all on public.citations to service_role;
