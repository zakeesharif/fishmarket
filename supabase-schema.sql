-- ============================================
-- FishMarket Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create listings table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  seller_email text,
  title text not null,
  description text,
  price numeric(10,2) not null,
  condition text check (condition in ('New', 'Like New', 'Good', 'Fair', 'Poor')),
  location text,
  category text check (category in ('Rods', 'Reels', 'Lures', 'Line', 'Tackle Boxes', 'Boats', 'Engines', 'Other')),
  photo_url text
);

-- Enable Row Level Security
alter table public.listings enable row level security;

-- Anyone can view listings
create policy "Anyone can view listings"
  on public.listings for select using (true);

-- Authenticated users can insert their own listings
create policy "Authenticated users can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

-- Users can update their own listings
create policy "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = user_id);

-- Users can delete their own listings
create policy "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

-- ============================================
-- Storage bucket for listing photos
-- ============================================

insert into storage.buckets (id, name, public)
  values ('listing-photos', 'listing-photos', true);

-- Anyone can view listing photos
create policy "Anyone can view listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- Authenticated users can upload photos
create policy "Authenticated users can upload listing photos"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.uid() is not null);

-- Users can delete their own photos
create policy "Users can delete their own photos"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
