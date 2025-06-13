create table if not exists public.swiss_model_configs (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  number_of_teams integer not null check (number_of_teams >= 4 and number_of_teams <= 64),
  matches_per_team integer not null check (matches_per_team >= 3 and matches_per_team <= 10),
  home_away_balance boolean not null default true,
  playoff_qualifiers integer not null check (playoff_qualifiers >= 2),
  direct_qualifiers integer not null check (direct_qualifiers >= 0),
  tiebreakers text[] not null default array['points', 'goal_difference', 'goals_for', 'head_to_head', 'initial_seed'],
  exclusions jsonb not null default '[]',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (competition_id)
);

-- Add RLS policies
alter table public.swiss_model_configs enable row level security;

create policy "Enable read access for authenticated users" on public.swiss_model_configs
  for select using (auth.role() = 'authenticated');

create policy "Enable insert/update for authenticated users" on public.swiss_model_configs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Add trigger to update updated_at timestamp
create trigger set_updated_at
  before update on public.swiss_model_configs
  for each row
  execute function public.set_updated_at(); 