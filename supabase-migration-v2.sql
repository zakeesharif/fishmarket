-- ============================================================
-- Seaitall v2 — Full Schema Migration
-- Run this entire file in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- ── PROFILES: add new columns ────────────────────────────────
alter table public.profiles
  add column if not exists avatar_url       text,
  add column if not exists cover_url        text,
  add column if not exists fishing_types    text[],
  add column if not exists location         text,
  add column if not exists rating           numeric(3,2) default 0,
  add column if not exists total_sales      integer default 0,
  add column if not exists total_listings   integer default 0,
  add column if not exists verified         boolean default false,
  add column if not exists instagram        text,
  add column if not exists youtube          text,
  add column if not exists bio              text;

-- ── LISTINGS: add new columns ────────────────────────────────
alter table public.listings
  add column if not exists photos       text[],
  add column if not exists views        integer default 0,
  add column if not exists saves        integer default 0,
  add column if not exists status       text default 'active',
  add column if not exists featured     boolean default false,
  add column if not exists sold_at      timestamptz;

-- ── CATCHES ──────────────────────────────────────────────────
create table if not exists public.catches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  species         text not null,
  weight_lbs      numeric(7,2),
  length_inches   numeric(6,1),
  location        text,
  lat             numeric(10,7),
  lng             numeric(10,7),
  gear_used       text,
  rod             text,
  reel            text,
  lure_bait       text,
  photo_url       text,
  caption         text,
  likes           integer default 0,
  created_at      timestamptz default now() not null
);

-- ── CATCH LIKES ──────────────────────────────────────────────
create table if not exists public.catch_likes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users(id) on delete cascade not null,
  catch_id  uuid references public.catches(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, catch_id)
);

-- ── CATCH COMMENTS ───────────────────────────────────────────
create table if not exists public.catch_comments (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users(id) on delete cascade not null,
  catch_id  uuid references public.catches(id) on delete cascade not null,
  content   text not null,
  created_at timestamptz default now() not null
);

-- ── RATINGS ──────────────────────────────────────────────────
create table if not exists public.ratings (
  id            uuid primary key default gen_random_uuid(),
  rater_id      uuid references auth.users(id) on delete cascade not null,
  rated_user_id uuid references auth.users(id) on delete cascade not null,
  listing_id    uuid references public.listings(id) on delete set null,
  stars         integer not null check (stars >= 1 and stars <= 5),
  review        text,
  created_at    timestamptz default now() not null
);

-- ── SAVED LISTINGS ───────────────────────────────────────────
create table if not exists public.saved_listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  created_at  timestamptz default now() not null,
  unique(user_id, listing_id)
);

-- ── CHARTERS ─────────────────────────────────────────────────
create table if not exists public.charters (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  captain_name      text not null,
  vessel_name       text,
  vessel_photo      text,
  location          text not null,
  price_per_person  numeric(10,2) not null,
  max_passengers    integer not null default 6,
  duration_hours    integer not null default 4,
  species_targeted  text[],
  description       text,
  rating            numeric(3,2) default 0,
  total_trips       integer default 0,
  status            text default 'active',
  created_at        timestamptz default now() not null
);

-- ── CHARTER BOOKINGS ─────────────────────────────────────────
create table if not exists public.charter_bookings (
  id          uuid primary key default gen_random_uuid(),
  charter_id  uuid references public.charters(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  passengers  integer not null default 1,
  total_price numeric(10,2) not null,
  status      text default 'pending',
  created_at  timestamptz default now() not null
);

-- ── REPORTS ──────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade not null,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  reason      text not null,
  created_at  timestamptz default now() not null
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null,
  title       text not null,
  body        text,
  link        text,
  read        boolean default false,
  created_at  timestamptz default now() not null
);

-- ── MESSAGES (ensure exists) ─────────────────────────────────
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid references auth.users(id) on delete cascade not null,
  recipient_id uuid references auth.users(id) on delete cascade not null,
  listing_id   uuid references public.listings(id) on delete set null,
  content      text not null,
  read         boolean default false,
  created_at   timestamptz default now() not null
);

-- ── ENABLE RLS ───────────────────────────────────────────────
alter table public.catches          enable row level security;
alter table public.catch_likes      enable row level security;
alter table public.catch_comments   enable row level security;
alter table public.ratings          enable row level security;
alter table public.saved_listings   enable row level security;
alter table public.charters         enable row level security;
alter table public.charter_bookings enable row level security;
alter table public.reports          enable row level security;
alter table public.notifications    enable row level security;
alter table public.messages         enable row level security;

-- ── RLS POLICIES ─────────────────────────────────────────────

-- Catches
drop policy if exists "Catches public read"   on public.catches;
drop policy if exists "Catches own insert"     on public.catches;
drop policy if exists "Catches own update"     on public.catches;
drop policy if exists "Catches own delete"     on public.catches;
create policy "Catches public read"   on public.catches for select using (true);
create policy "Catches own insert"    on public.catches for insert with check (auth.uid() = user_id);
create policy "Catches own update"    on public.catches for update using (auth.uid() = user_id);
create policy "Catches own delete"    on public.catches for delete using (auth.uid() = user_id);

-- Catch likes
drop policy if exists "CatchLikes public read" on public.catch_likes;
drop policy if exists "CatchLikes own insert"  on public.catch_likes;
drop policy if exists "CatchLikes own delete"  on public.catch_likes;
create policy "CatchLikes public read" on public.catch_likes for select using (true);
create policy "CatchLikes own insert"  on public.catch_likes for insert with check (auth.uid() = user_id);
create policy "CatchLikes own delete"  on public.catch_likes for delete using (auth.uid() = user_id);

-- Catch comments
drop policy if exists "CatchComments public read" on public.catch_comments;
drop policy if exists "CatchComments own insert"  on public.catch_comments;
drop policy if exists "CatchComments own delete"  on public.catch_comments;
create policy "CatchComments public read" on public.catch_comments for select using (true);
create policy "CatchComments own insert"  on public.catch_comments for insert with check (auth.uid() = user_id);
create policy "CatchComments own delete"  on public.catch_comments for delete using (auth.uid() = user_id);

-- Ratings
drop policy if exists "Ratings public read" on public.ratings;
drop policy if exists "Ratings own insert"  on public.ratings;
create policy "Ratings public read" on public.ratings for select using (true);
create policy "Ratings own insert"  on public.ratings for insert with check (auth.uid() = rater_id);

-- Saved listings
drop policy if exists "Saved own read"   on public.saved_listings;
drop policy if exists "Saved own insert" on public.saved_listings;
drop policy if exists "Saved own delete" on public.saved_listings;
create policy "Saved own read"   on public.saved_listings for select using (auth.uid() = user_id);
create policy "Saved own insert" on public.saved_listings for insert with check (auth.uid() = user_id);
create policy "Saved own delete" on public.saved_listings for delete using (auth.uid() = user_id);

-- Charters
drop policy if exists "Charters public read"  on public.charters;
drop policy if exists "Charters own insert"   on public.charters;
drop policy if exists "Charters own update"   on public.charters;
drop policy if exists "Charters own delete"   on public.charters;
create policy "Charters public read"  on public.charters for select using (true);
create policy "Charters own insert"   on public.charters for insert with check (auth.uid() = user_id);
create policy "Charters own update"   on public.charters for update using (auth.uid() = user_id);
create policy "Charters own delete"   on public.charters for delete using (auth.uid() = user_id);

-- Charter bookings
drop policy if exists "Bookings own read"   on public.charter_bookings;
drop policy if exists "Bookings own insert" on public.charter_bookings;
create policy "Bookings own read"   on public.charter_bookings for select using (auth.uid() = user_id);
create policy "Bookings own insert" on public.charter_bookings for insert with check (auth.uid() = user_id);

-- Reports
drop policy if exists "Reports own insert" on public.reports;
create policy "Reports own insert" on public.reports for insert with check (auth.uid() = reporter_id);

-- Notifications
drop policy if exists "Notifs own read"   on public.notifications;
drop policy if exists "Notifs own update" on public.notifications;
create policy "Notifs own read"   on public.notifications for select using (auth.uid() = user_id);
create policy "Notifs own update" on public.notifications for update using (auth.uid() = user_id);

-- Messages
drop policy if exists "Messages own read"   on public.messages;
drop policy if exists "Messages own insert" on public.messages;
drop policy if exists "Messages own update" on public.messages;
create policy "Messages own read"   on public.messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Messages own insert" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Messages own update" on public.messages for update using (auth.uid() = recipient_id);

-- Profiles (ensure RLS is on with public read)
alter table public.profiles enable row level security;
drop policy if exists "Profiles public read"  on public.profiles;
drop policy if exists "Profiles own update"   on public.profiles;
drop policy if exists "Profiles own insert"   on public.profiles;
create policy "Profiles public read"  on public.profiles for select using (true);
create policy "Profiles own update"   on public.profiles for update using (auth.uid() = id);
create policy "Profiles own insert"   on public.profiles for insert with check (auth.uid() = id);

-- Listings
alter table public.listings enable row level security;
drop policy if exists "Listings public read"  on public.listings;
drop policy if exists "Listings own insert"   on public.listings;
drop policy if exists "Listings own update"   on public.listings;
drop policy if exists "Listings own delete"   on public.listings;
create policy "Listings public read"  on public.listings for select using (true);
create policy "Listings own insert"   on public.listings for insert with check (auth.uid() = user_id);
create policy "Listings own update"   on public.listings for update using (auth.uid() = user_id);
create policy "Listings own delete"   on public.listings for delete using (auth.uid() = user_id);

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_listings_user_id      on public.listings(user_id);
create index if not exists idx_listings_category     on public.listings(category);
create index if not exists idx_listings_status       on public.listings(status);
create index if not exists idx_listings_created_at   on public.listings(created_at desc);
create index if not exists idx_catches_user_id       on public.catches(user_id);
create index if not exists idx_catches_created_at    on public.catches(created_at desc);
create index if not exists idx_catch_likes_catch_id  on public.catch_likes(catch_id);
create index if not exists idx_messages_recipient    on public.messages(recipient_id);
create index if not exists idx_notifications_user    on public.notifications(user_id);

-- ── SEED: Sample Charters ────────────────────────────────────
SET session_replication_role = replica;

insert into public.charters
  (id, user_id, captain_name, vessel_name, location, price_per_person, max_passengers, duration_hours, species_targeted, description, rating, total_trips, created_at)
values
  ('eeeeeeee-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000002',
   'Capt. Dave Morello', 'Sea Fever', 'Captree, NY',
   185.00, 6, 8,
   ARRAY['Striped Bass','Bluefish','Fluke'],
   'Full-day party boat fishing out of Captree State Park. I''ve been running this boat for 20 years. We target stripers in the fall run, fluke in summer, and blues year-round. All tackle provided, mates on board, fish cleaned and bagged. No experience necessary.',
   4.8, 312,
   now() - interval '120 days'),

  ('eeeeeeee-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000004',
   'Capt. Rob Vasquez', 'Blue Horizon', 'Miami, FL',
   295.00, 4, 8,
   ARRAY['Mahi-Mahi','Wahoo','Sailfish','Tuna'],
   'Offshore sportfishing aboard a 35'' Contender. We run 40-60 miles offshore to the Gulf Stream. Full spread of trolling lures, live bait available. Targeting mahi, wahoo, sailfish, and tuna depending on the season. IGFA certified. Light tackle available on request.',
   4.9, 487,
   now() - interval '200 days'),

  ('eeeeeeee-0000-0000-0000-000000000003',
   'aaaaaaaa-0000-0000-0000-000000000005',
   'Capt. Lou Ferrara', 'Shallow Water', 'Tampa Bay, FL',
   225.00, 2, 6,
   ARRAY['Snook','Redfish','Tarpon','Trout'],
   'Private light tackle inshore fishing in Tampa Bay and surrounding waters. I''m a full-time guide specializing in snook, redfish, and tarpon. We fish the flats, the mangroves, and the grass beds. I''ll put you on fish. Kayak option available for ultra-shallow spots.',
   5.0, 203,
   now() - interval '80 days'),

  ('eeeeeeee-0000-0000-0000-000000000004',
   'aaaaaaaa-0000-0000-0000-000000000003',
   'Capt. Jane Whitfield', 'Striper Dreams', 'Cape Cod, MA',
   175.00, 2, 5,
   ARRAY['Striped Bass','False Albacore','Bluefish'],
   'Fly fishing and light tackle guide on Cape Cod. Orvis-certified casting instructor. We target stripers on the flats, false albacore in the fall run, and blues on the surface. Wading and boat options. I provide flies and leaders. Perfect for beginners and experienced fly fishers alike.',
   4.7, 156,
   now() - interval '45 days');

-- ── SEED: Sample Catches ─────────────────────────────────────
insert into public.catches
  (id, user_id, species, weight_lbs, length_inches, location, gear_used, rod, reel, lure_bait, photo_url, caption, likes, created_at)
values
  ('ffffffff-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'Striped Bass', 38.5, 44.0, 'Montauk Point, NY',
   'Daiwa Saltiga 14'' + Van Staal VR75',
   'Daiwa Saltiga 14'' Surf', 'Van Staal VR75',
   'Bunker chunk on circle hook',
   'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
   'Fall run cow striper on a bunker chunk. 38.5 lbs on the Boga. Released after a quick photo. The Montauk Point rip was absolute fire at first light.',
   24,
   now() - interval '2 days'),

  ('ffffffff-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000004',
   'Mahi-Mahi', 32.0, 46.0, 'Gulf Stream, Miami FL',
   'Shimano Talica 16 spinning setup',
   'Custom 7'' spinning rod', 'Shimano Talica 16',
   'Shimano Butterfly flat-fall 150g',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop',
   'Bull mahi lit up like a neon sign when it hit the surface. 32 lbs, 46 inches. Released to fight another day. Gulf Stream was holding amazing water.',
   41,
   now() - interval '5 days'),

  ('ffffffff-0000-0000-0000-000000000003',
   'aaaaaaaa-0000-0000-0000-000000000003',
   'False Albacore', 9.2, 24.5, 'Nauset Beach, Cape Cod MA',
   'Orvis Recon 9wt + Lamson Liquid',
   'Orvis Recon 9'' 9wt', 'Lamson Liquid 9',
   'White Hogy epoxy jig 3oz',
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop',
   'False albacore on the fly. These fish are absolutely insane — took 100 yards of backing in 4 seconds. Best light tackle fish in the ocean.',
   57,
   now() - interval '8 days'),

  ('ffffffff-0000-0000-0000-000000000004',
   'aaaaaaaa-0000-0000-0000-000000000005',
   'Snook', 28.0, 34.5, 'Tampa Bay, FL',
   'Shimano Stradic FL 4000 on Teramar MH',
   'Shimano Teramar 7''6" MH', 'Shimano Stradic FL 4000',
   'Live pinfish',
   'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop',
   'Slot snook on live pinfish under the bridge lights at midnight. Tampa Bay inshore at its absolute finest. Measured 34.5 inches — perfect size slot fish.',
   33,
   now() - interval '12 days'),

  ('ffffffff-0000-0000-0000-000000000005',
   'aaaaaaaa-0000-0000-0000-000000000009',
   'Bluefin Tuna', 186.0, 72.0, 'San Diego, CA',
   'Accurate Tern 2-speed + Calstar 7'' heavy',
   'Calstar 7'' Grafighter 700XH', 'Accurate Tern ATD-30',
   'Flat fall jig 250g Blue/Pink',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
   'Giant Pacific Bluefin on the iron. 186 lbs, 72 inch fork length. 45-minute fight. This is what we chase every summer. Absolutely the greatest fish in the Pacific.',
   89,
   now() - interval '3 days'),

  ('ffffffff-0000-0000-0000-000000000006',
   'aaaaaaaa-0000-0000-0000-000000000007',
   'Red Snapper', 14.5, 26.0, 'Gulf of Mexico, New Orleans LA',
   'Penn Squall 30LD + 7'' heavy boat rod',
   'Custom 7'' Roller Rod', 'Penn Squall 30LD',
   'Cigar minnow on a 4oz knocker rig',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
   'Red snapper on the knocker rig in 120 feet of Gulf water. Dead center of a productive reef. These things eat like they''re being paid to.',
   18,
   now() - interval '20 days'),

  ('ffffffff-0000-0000-0000-000000000007',
   'aaaaaaaa-0000-0000-0000-000000000008',
   'Striped Bass', 22.0, 36.0, 'Buzzards Bay, Cape Cod MA',
   'Ugly Stik + Penn Battle on kayak',
   'Ugly Stik Elite 7'' M', 'Penn Battle III 4000',
   'White 6'' paddle tail on 1oz jighead',
   'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop',
   'Kayak striper in Buzzards Bay on a paddle tail. Drifting the current into a rock pile. These fish hold so tight to structure it''s almost unfair.',
   14,
   now() - interval '6 days'),

  ('ffffffff-0000-0000-0000-000000000008',
   'aaaaaaaa-0000-0000-0000-000000000002',
   'Bluefish', 14.0, 32.0, 'Captree Inlet, NY',
   'Penn Battle III 5000 + 9'' heavy spinning',
   'Penn Carnage II 9'' Heavy', 'Penn Battle III 5000',
   'Gibbs Danny plug 3oz',
   'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop',
   'Big chopper blue annihilated a Gibbs Danny plug in the Captree inlet. These fish hit like freight trains. Hands down the best top-water strike in saltwater.',
   22,
   now() - interval '4 days');

SET session_replication_role = DEFAULT;

-- Verify
select 'profiles' as tbl, count(*) from public.profiles
union all select 'listings', count(*) from public.listings
union all select 'catches', count(*) from public.catches
union all select 'charters', count(*) from public.charters;
