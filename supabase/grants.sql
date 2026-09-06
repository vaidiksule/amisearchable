-- Run this now if tables already exist but writes fail with 42501.

grant usage on schema public to anon, authenticated, service_role;

grant select on public.domains to anon, authenticated;
grant select on public.checks to anon, authenticated;
grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.monitors to authenticated;

grant all on public.users to service_role;
grant all on public.domains to service_role;
grant all on public.checks to service_role;
grant all on public.monitors to service_role;
grant all on public.badge_hits to service_role;
