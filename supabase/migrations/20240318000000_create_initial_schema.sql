-- Create countries table
create table public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  flag_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create competitions table
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  country_id uuid references public.countries(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create teams table
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create fixtures table
create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  team_id_home uuid not null references public.teams(id) on delete cascade,
  team_id_away uuid not null references public.teams(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  score_home integer,
  score_away integer,
  date timestamp with time zone not null,
  status text not null check (status in ('SCHEDULED', 'LIVE', 'FT', 'POSTPONED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create news table
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  category text not null,
  slug text not null unique,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create featured matches table
create table public.featured_matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.countries enable row level security;
alter table public.competitions enable row level security;
alter table public.teams enable row level security;
alter table public.fixtures enable row level security;
alter table public.news enable row level security;
alter table public.featured_matches enable row level security;

-- Create policies for public read access
create policy "Allow public read access" on public.countries for select using (true);
create policy "Allow public read access" on public.competitions for select using (true);
create policy "Allow public read access" on public.teams for select using (true);
create policy "Allow public read access" on public.fixtures for select using (true);
create policy "Allow public read access" on public.news for select using (true);
create policy "Allow public read access" on public.featured_matches for select using (true);

-- Create updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.countries
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.competitions
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.teams
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.fixtures
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.news
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.featured_matches
  for each row
  execute function public.handle_updated_at(); 