-- TurcoLive Supabase setup reference
-- Run this in the Supabase SQL editor if the listings table or storage bucket are not created yet.

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
  status text not null default 'pending'
);

alter table public.listings enable row level security;

create policy "Approved listings are publicly readable"
  on public.listings
  for select
  using (status = 'approved');

-- Optional MVP admin support. Remove or restrict this before production.
create policy "Temporary admin can read all listings in MVP"
  on public.listings
  for select
  using (true);

create policy "Anyone can create pending listings"
  on public.listings
  for insert
  with check (status = 'pending');

-- Optional MVP admin support. Remove or restrict this before production.
create policy "Temporary admin can update listing status in MVP"
  on public.listings
  for update
  using (true)
  with check (status in ('pending', 'approved', 'rejected', 'spam'));

-- Optional MVP admin support. Remove or restrict this before production.
create policy "Temporary admin can delete listings in MVP"
  on public.listings
  for delete
  using (true);

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "Listing photos are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'listing-photos');

create policy "Anyone can upload listing photos"
  on storage.objects
  for insert
  with check (bucket_id = 'listing-photos');
