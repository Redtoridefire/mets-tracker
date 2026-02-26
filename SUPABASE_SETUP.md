# Supabase setup for Mets Cork Board

## 1) Environment variables
Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

Then restart the dev server.

## 2) Enable anonymous auth
In Supabase Dashboard:
- **Authentication → Providers → Anonymous Sign-Ins**
- Toggle **Enable anonymous sign-ins** ON.

## 3) SQL schema + RLS (copy/paste)
Run this in **Supabase SQL Editor**:

```sql
-- Extensions
create extension if not exists pgcrypto;

-- Metadata table
create table if not exists public.memory_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  image_path text not null unique,
  caption text not null default '' check (char_length(caption) <= 220),
  game_label text not null default '' check (char_length(game_label) <= 90),
  created_at timestamptz not null default now()
);

alter table public.memory_posts enable row level security;

-- Everyone (anonymous authenticated sessions included) can read the board
drop policy if exists "memory_posts_select_all" on public.memory_posts;
create policy "memory_posts_select_all"
on public.memory_posts
for select
to authenticated
using (true);

-- Users can insert only rows tied to their own auth uid
drop policy if exists "memory_posts_insert_own" on public.memory_posts;
create policy "memory_posts_insert_own"
on public.memory_posts
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update/delete only their own rows (optional but safer)
drop policy if exists "memory_posts_update_own" on public.memory_posts;
create policy "memory_posts_update_own"
on public.memory_posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "memory_posts_delete_own" on public.memory_posts;
create policy "memory_posts_delete_own"
on public.memory_posts
for delete
to authenticated
using (auth.uid() = user_id);


-- Moderation reports table (simple user report queue)
create table if not exists public.memory_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.memory_posts(id) on delete cascade,
  reporter_id uuid not null,
  reason text not null default '' check (char_length(reason) <= 250),
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

alter table public.memory_reports enable row level security;

drop policy if exists "memory_reports_insert_own" on public.memory_reports;
create policy "memory_reports_insert_own"
on public.memory_reports
for insert
to authenticated
with check (auth.uid() = reporter_id);

drop policy if exists "memory_reports_select_all" on public.memory_reports;
create policy "memory_reports_select_all"
on public.memory_reports
for select
to authenticated
using (true);

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-board',
  'memory-board',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS policies
drop policy if exists "memory_board_read_authenticated" on storage.objects;
create policy "memory_board_read_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'memory-board');

drop policy if exists "memory_board_insert_own_prefix" on storage.objects;
create policy "memory_board_insert_own_prefix"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'memory-board'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "memory_board_delete_own_prefix" on storage.objects;
create policy "memory_board_delete_own_prefix"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'memory-board'
  and split_part(name, '/', 1) = auth.uid()::text
);
```

## 4) Notes
- Images are stored in a **private** bucket.
- The app renders photos via **signed URLs** (short-lived links), not permanently public URLs.
- No explicit login UI is required; users are automatically given an anonymous Supabase session.
- The Cork Board delete button appears only on posts owned by the current anonymous user (`user_id = auth.uid()`).
- Broken image rows are hidden in-app, and broken rows owned by the current user are auto-cleaned from metadata on refresh.
- Uploads are compressed client-side to reduce storage and bandwidth costs before upload.
- Users can submit a simple report (`memory_reports`) on posts they do not own.
- Board loading now uses paged fetches (Load More) to keep initial payloads lighter on large photo walls.
- Signed image URLs are cached client-side in-memory briefly to reduce repeated sign requests.
- If `memory_reports` has not been created yet, the app now gracefully falls back to an empty moderation queue (no board-breaking error).


### If you already ran an older version
Run this to update report select policy for the moderation queue:

```sql
drop policy if exists "memory_reports_select_own" on public.memory_reports;
drop policy if exists "memory_reports_select_all" on public.memory_reports;
create policy "memory_reports_select_all"
on public.memory_reports
for select
to authenticated
using (true);
```
