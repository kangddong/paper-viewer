create table public.papers (
  id text primary key,
  title text not null,
  authors text,
  abstract text,
  source_url text,
  added_at date,
  translation_status text not null default 'draft' check (translation_status in ('draft', 'in_progress', 'done')),
  ko_html text,
  orig_html text,
  ko_html_path text not null,
  orig_html_path text not null,
  figures_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index papers_added_at_idx on public.papers (added_at desc nulls last, id);
create index papers_search_idx on public.papers using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(authors, '') || ' ' || coalesce(abstract, ''))
);

create or replace function public.set_papers_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_papers_updated_at
before update on public.papers
for each row
execute function public.set_papers_updated_at();

revoke all on function public.set_papers_updated_at() from public;

grant select on public.papers to anon, authenticated;

alter table public.papers enable row level security;

create policy "Papers are publicly readable"
on public.papers
for select
to anon, authenticated
using (true);

comment on table public.papers is 'Paper translation archive metadata and HTML content for the Paper Translation Collector.';
comment on column public.papers.ko_html is 'Korean translated HTML content rendered by the viewer.';
comment on column public.papers.orig_html is 'Original paper HTML content rendered in split view iframe.';
