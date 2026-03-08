-- Run this in Supabase SQL Editor after schema.sql
-- Allows authenticated admin users to read and write all records

create policy "Admin full access" on services
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
