create table services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description_en text,
  description_ua text,
  category text,
  address text,
  phone text,
  email text,
  website text,
  instagram text,
  facebook text,
  linkedin text,
  messenger text,
  images text,
  approved boolean default false,
  featured boolean default false,
  notes text,
  submitted_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table services enable row level security;

create policy "Public can read approved services" on services
  for select using (approved = true);
