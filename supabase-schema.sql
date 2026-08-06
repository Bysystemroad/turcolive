-- TurcoLive Supabase production security setup
-- Run this in the Supabase SQL editor before public launch.
-- Replace the example admin UUID/email at the bottom with your real Supabase Auth admin user.

create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_status_check'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_status_check
      check (status in ('pending', 'approved', 'rejected', 'spam'));
  end if;
end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;
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

grant execute on function public.is_turcolive_admin() to anon, authenticated;

drop policy if exists "Approved listings are publicly readable" on public.listings;
drop policy if exists "Temporary admin can read all listings in MVP" on public.listings;
drop policy if exists "Anyone can create pending listings" on public.listings;
drop policy if exists "Temporary admin can update listing status in MVP" on public.listings;
drop policy if exists "Temporary admin can delete listings in MVP" on public.listings;
drop policy if exists "Admins can read all listings" on public.listings;
drop policy if exists "Admins can update listings" on public.listings;
drop policy if exists "Admins can delete listings" on public.listings;
drop policy if exists "Public can create pending listings" on public.listings;

create policy "Public can read approved listings"
  on public.listings
  for select
  to anon, authenticated
  using (status = 'approved' or public.is_turcolive_admin());

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

drop policy if exists "Admin users can read own record" on public.admin_users;
drop policy if exists "Admins can read admin users" on public.admin_users;

create policy "Admin users can read own record"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_turcolive_admin());

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Listing photos are publicly readable" on storage.objects;
drop policy if exists "Anyone can upload listing photos" on storage.objects;
drop policy if exists "Public can upload listing images" on storage.objects;
drop policy if exists "Public can read listing photos" on storage.objects;

create policy "Public can read listing photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'listing-photos');

-- No public storage insert/update/delete policies are created.
-- Listing photo uploads are handled only by Vercel Functions with SUPABASE_SERVICE_ROLE_KEY.

-- After creating an admin user in Supabase Auth, run this with the real values:
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@turcolive.com')
-- on conflict (user_id) do update set email = excluded.email;
