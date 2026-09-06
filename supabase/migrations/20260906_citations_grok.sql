-- If citations table already exists without grok, widen the check:

alter table public.citations drop constraint if exists citations_engine_check;
alter table public.citations
  add constraint citations_engine_check
  check (engine in ('chatgpt', 'claude', 'perplexity', 'gemini', 'grok'));
