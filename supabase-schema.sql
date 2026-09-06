-- Cachimbo Radical — schema inicial (correr no SQL Editor do Supabase)

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post', 'podcast')),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (kind, slug)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete restrict,
  title text not null,
  slug text not null unique,
  content text not null,
  published boolean not null default true,
  author_email text,
  created_at timestamptz not null default now()
);

create table if not exists podcasts (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  audio_url text not null,
  published boolean not null default true,
  author_email text,
  created_at timestamptz not null default now()
);

alter table sections enable row level security;
alter table posts enable row level security;
alter table podcasts enable row level security;

create policy "sections_public_read" on sections for select using (true);
create policy "posts_public_read" on posts for select using (published = true);
create policy "podcasts_public_read" on podcasts for select using (published = true);

create policy "sections_write_auth" on sections for insert to authenticated with check (true);
create policy "posts_all_auth" on posts for all to authenticated using (true) with check (true);
create policy "podcasts_all_auth" on podcasts for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

create policy "audio_public_read" on storage.objects for select using (bucket_id = 'audio');
create policy "audio_auth_upload" on storage.objects for insert to authenticated with check (bucket_id = 'audio');
