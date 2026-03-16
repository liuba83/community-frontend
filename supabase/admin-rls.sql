-- Run this in Supabase SQL Editor after schema.sql
-- Allows only users with app_metadata.role = 'admin' to read and write all records
-- Set this claim via Supabase dashboard: Authentication → Users → user → app_metadata → {"role": "admin"}
-- Or via SQL: update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'your@email.com';

drop policy if exists "Admin full access" on services;

create policy "Admin full access" on services
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
