-- TurcoLive Supabase production security setup
-- Run this in the Supabase SQL editor before public launch.
-- Existing listings are preserved. user_id stays nullable for old listings.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_blocked boolean not null default false
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  owner_email text,
  full_name text not null,
  title text not null,
  city text not null,
  address text not null,
  monthly_rent text not null,
  deposit text not null,
  room_type text not null,
  house_type text not null,
  target_group text not null,
  gender_preference text not null,
  people_count text not null,
  description text not null,
  contact_info text not null,
  phone_number text not null,
  image_urls text[] not null default '{}',
  status text not null default 'pending',
  constraint listings_status_check check (status in ('pending', 'approved', 'rejected', 'spam'))
);

alter table public.listings add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.listings add column if not exists owner_email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists is_blocked boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'listings_status_check'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_status_check
      check (status in ('pending', 'approved', 'rejected', 'spam'));
  end if;
end $$;

alter table public.listings enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_turcolive_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.is_current_user_blocked()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select is_blocked
    from public.profiles
    where id = auth.uid()
  ), false);
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'TurcoLive kullanıcısı'),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

grant execute on function public.is_turcolive_admin() to anon, authenticated;
grant execute on function public.is_current_user_blocked() to anon, authenticated;

drop policy if exists "Approved listings are publicly readable" on public.listings;
drop policy if exists "Temporary admin can read all listings in MVP" on public.listings;
drop policy if exists "Anyone can create pending listings" on public.listings;
drop policy if exists "Temporary admin can update listing status in MVP" on public.listings;
drop policy if exists "Temporary admin can delete listings in MVP" on public.listings;
drop policy if exists "Admins can read all listings" on public.listings;
drop policy if exists "Admins can update listings" on public.listings;
drop policy if exists "Admins can delete listings" on public.listings;
drop policy if exists "Public can create pending listings" on public.listings;
drop policy if exists "Public can read approved listings" on public.listings;
drop policy if exists "Users can read own listings" on public.listings;
drop policy if exists "Users can update own listings" on public.listings;
drop policy if exists "Users can delete own listings" on public.listings;

create policy "Public can read approved listings"
  on public.listings
  for select
  to anon, authenticated
  using (
    status = 'approved'
    or public.is_turcolive_admin()
    or auth.uid() = user_id
  );

create policy "Admins can update listings"
  on public.listings
  for update
  to authenticated
  using (public.is_turcolive_admin())
  with check (
    public.is_turcolive_admin()
    and status in ('pending', 'approved', 'rejected', 'spam')
  );

create policy "Admins can delete listings"
  on public.listings
  for delete
  to authenticated
  using (public.is_turcolive_admin());

create policy "Users can update own listings"
  on public.listings
  for update
  to authenticated
  using (auth.uid() = user_id and not public.is_current_user_blocked())
  with check (
    auth.uid() = user_id
    and not public.is_current_user_blocked()
    and status in ('pending', 'approved')
  );

create policy "Users can delete own listings"
  on public.listings
  for delete
  to authenticated
  using (auth.uid() = user_id and not public.is_current_user_blocked());

drop policy if exists "Admin users can read own record" on public.admin_users;
drop policy if exists "Admins can read admin users" on public.admin_users;

create policy "Admin users can read own record"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_turcolive_admin());

drop policy if exists "Profiles can read own profile" on public.profiles;
drop policy if exists "Profiles can update own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;

create policy "Profiles can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_turcolive_admin());

create policy "Profiles can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id and not is_blocked)
  with check (auth.uid() = id and not is_blocked);

create policy "Admins can update profiles"
  on public.profiles
  for update
  to authenticated
  using (public.is_turcolive_admin())
  with check (public.is_turcolive_admin());

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Listing photos are publicly readable" on storage.objects;
drop policy if exists "Anyone can upload listing photos" on storage.objects;
drop policy if exists "Public can upload listing images" on storage.objects;
drop policy if exists "Public can read listing photos" on storage.objects;
drop policy if exists "Public can view photos" on storage.objects;
drop policy if exists "Public can upload photos" on storage.objects;

-- No public storage select/insert/update/delete policies are created.
-- The listing-photos bucket remains public for direct public URL viewing.
-- Listing photo uploads/deletes are handled only by Vercel Functions with SUPABASE_SERVICE_ROLE_KEY.

-- After creating/keeping an admin user in Supabase Auth, run this with the real values:
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@turcolive.com')
-- on conflict (user_id) do update set email = excluded.email;
