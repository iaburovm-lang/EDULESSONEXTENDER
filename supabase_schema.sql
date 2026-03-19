-- Run this in your Supabase SQL editor (Database → SQL Editor → New Query)

create table users (
  id          uuid primary key default gen_random_uuid(),
  login       text unique not null,
  active      boolean not null default true,
  created_at  timestamptz default now(),
  last_used   timestamptz
);

-- Only your server can read/write (via service role key)
-- Disable public access
alter table users enable row level security;
