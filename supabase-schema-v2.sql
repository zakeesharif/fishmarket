-- ─── Profiles ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  bio        text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Messages ──────────────────────────────────────────────────────────────
create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  listing_id   uuid references listings(id) on delete set null,
  content      text not null,
  read         boolean not null default false,
  created_at   timestamptz default now()
);

alter table messages enable row level security;

create policy "Users can read their own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Authenticated users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipients can mark messages as read"
  on messages for update
  using (auth.uid() = recipient_id);


-- ─── Saved listings ────────────────────────────────────────────────────────
create table if not exists saved_listings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, listing_id)
);

alter table saved_listings enable row level security;

create policy "Users can read their own saved listings"
  on saved_listings for select using (auth.uid() = user_id);

create policy "Users can save listings"
  on saved_listings for insert with check (auth.uid() = user_id);

create policy "Users can unsave listings"
  on saved_listings for delete using (auth.uid() = user_id);
