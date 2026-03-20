-- ============================================================
-- Catches Table — Run this in your Supabase SQL Editor
-- Run this BEFORE running supabase-seed.sql
-- ============================================================

-- ── Create catches table ─────────────────────────────────────
create table if not exists public.catches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  species     text not null,
  weight_lbs  numeric(7,2),
  location    text,
  gear_used   text,
  photo_url   text,
  caption     text,
  created_at  timestamptz default now() not null
);

-- ── Enable RLS ───────────────────────────────────────────────
alter table public.catches enable row level security;

-- ── RLS Policies ─────────────────────────────────────────────

-- Anyone can read catches (public feed)
create policy "Catches are publicly readable"
  on public.catches
  for select
  using (true);

-- Authenticated users can insert their own catches
create policy "Users can insert own catches"
  on public.catches
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own catches
create policy "Users can update own catches"
  on public.catches
  for update
  using (auth.uid() = user_id);

-- Users can delete their own catches
create policy "Users can delete own catches"
  on public.catches
  for delete
  using (auth.uid() = user_id);

-- ── Verify ───────────────────────────────────────────────────
select 'catches table created' as status;
