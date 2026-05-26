-- TurcoLive Supabase setup reference
-- Run this in the Supabase SQL editor if the listings table or storage bucket are not created yet.

create table if not exists public.listings (
  id uuid primary key,
  created_at timestamptz not null default now(),
  full_name text not null,
  title text not null,
  city text not null,
  district text not null,
  rent text not null,
  deposit text not null,
  room_type text not null,
  home_type text not null,
  target_audience text not null,
  gender_preference text not null,
  people_count text not null,
  description text not null,
  contact text not null,
  phone_number text not null,
  image_file_names text[] not null default '{}',
  image_urls text[] not null default '{}'
);

alter table public.listings enable row level security;

create policy "Public listings are readable"
  on public.listings
  for select
  using (true);

create policy "Anyone can create listings"
  on public.listings
  for insert
  with check (true);

-- Optional MVP admin support. Remove or restrict this before production.
create policy "Anyone can delete listings in MVP"
  on public.listings
  for delete
  using (true);

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Listing images are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'listing-images');

create policy "Anyone can upload listing images"
  on storage.objects
  for insert
  with check (bucket_id = 'listing-images');
