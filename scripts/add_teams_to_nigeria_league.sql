-- First, make sure Nigeria exists in the countries table
INSERT INTO public.countries (id, name, flag_url)
VALUES ('e7f2e426-63a7-4c66-b7a4-c15e5c3c4b0f', 'Nigeria', '/flags/nigeria.png')
ON CONFLICT (id) DO NOTHING;

-- Create the Nigeria Pro Club League if it doesn't exist
INSERT INTO public.competitions (id, name, type, status, start_date, end_date, max_teams)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e',
  'Nigeria Pro Club League',
  'league',
  'active',
  NOW(),
  NOW() + INTERVAL '3 months',
  12
)
ON CONFLICT (id) DO NOTHING;

-- Add teams to the Nigeria Pro Club League
DO $$ 
DECLARE
  team_id UUID;
  v_competition_id UUID := 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4e';  -- ID of existing Nigeria Pro Club League
  v_team_count INTEGER;
BEGIN
  -- First, check if we already have teams in the competition
  SELECT COUNT(*)
  INTO v_team_count
  FROM public.competition_teams
  WHERE competition_id = v_competition_id;

  IF v_team_count = 0 THEN
    -- Only add teams if the competition is empty
    FOR team_id IN 
      SELECT id 
      FROM public.teams 
      WHERE manager_id IS NOT NULL 
      LIMIT 12
    LOOP
      -- Add each team with just the basic required fields
      INSERT INTO public.competition_teams (
        competition_id,
        team_id,
        status
      ) VALUES (
        v_competition_id,
        team_id,
        'active'
      );
    END LOOP;
  END IF;
END $$; 