-- ============================================================
-- Seaitall — RLS Diagnostic & Fix
-- Run this in Supabase SQL Editor.
-- Read the output after each section to see what's wrong.
-- ============================================================


-- ── STEP 1: Verify seed data actually exists ─────────────────
-- Expected: 10 profiles, 30 listings, 14 messages
select 'profiles' as table_name, count(*) as row_count from public.profiles
union all
select 'listings', count(*) from public.listings
union all
select 'messages', count(*) from public.messages;


-- ── STEP 2: Check RLS status on the listings table ───────────
-- relrowsecurity = true means RLS is ON (good)
-- relforcerowsecurity = true means it applies to table owner too
select
  relname        as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as force_rls
from pg_class
where relname in ('listings', 'profiles', 'messages')
  and relnamespace = 'public'::regnamespace;


-- ── STEP 3: List every policy on the listings table ──────────
-- You should see at least one SELECT policy with cmd = 'SELECT' and qual = true
select
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'listings'
  and schemaname = 'public'
order by cmd;


-- ── STEP 4: Test what the anon role can actually see ─────────
-- Run the query as the anon role to replicate exactly what the
-- browse page client (anon key) sees.
set role anon;
select count(*) as anon_can_see from public.listings;
reset role;


-- ============================================================
-- FIX: Drop all existing SELECT policies and recreate cleanly
-- ============================================================

-- Drop any existing select policies (safe to run even if they don't exist)
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where tablename = 'listings'
      and schemaname = 'public'
      and cmd = 'SELECT'
  loop
    execute format('drop policy if exists %I on public.listings', pol.policyname);
    raise notice 'Dropped policy: %', pol.policyname;
  end loop;
end;
$$;

-- Make sure RLS is enabled
alter table public.listings enable row level security;

-- Create a clean, permissive public read policy
create policy "public_read_listings"
  on public.listings
  for select
  using (true);

-- Grant SELECT to both anon and authenticated roles explicitly
grant select on public.listings to anon;
grant select on public.listings to authenticated;


-- ── STEP 5: Re-verify anon can now see rows ──────────────────
set role anon;
select count(*) as anon_can_see_after_fix from public.listings;
reset role;

-- Also confirm the new policy is in place
select policyname, cmd, qual
from pg_policies
where tablename = 'listings'
  and schemaname = 'public';


-- ── STEP 6: Quick sample of the actual data ──────────────────
select id, title, category, price, condition, location, created_at
from public.listings
order by created_at desc
limit 5;
