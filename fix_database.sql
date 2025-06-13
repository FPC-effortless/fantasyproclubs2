-- COMPREHENSIVE DATABASE FIX FOR COMPETITION_TEAMS TABLE
-- Run this script in your Supabase SQL Editor to fix all missing columns

-- Add all missing columns to competition_teams table
DO $$ 
BEGIN
    -- Add points column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'points'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN points INTEGER DEFAULT 0;
    END IF;

    -- Add matches_played column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'matches_played'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN matches_played INTEGER DEFAULT 0;
    END IF;

    -- Add wins column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'wins'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN wins INTEGER DEFAULT 0;
    END IF;

    -- Add draws column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'draws'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN draws INTEGER DEFAULT 0;
    END IF;

    -- Add losses column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'losses'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN losses INTEGER DEFAULT 0;
    END IF;

    -- Add goals_for column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'goals_for'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN goals_for INTEGER DEFAULT 0;
    END IF;

    -- Add goals_against column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'goals_against'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN goals_against INTEGER DEFAULT 0;
    END IF;

    -- Add goal_difference column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'goal_difference'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN goal_difference INTEGER DEFAULT 0;
    END IF;

    -- Add position column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competition_teams' AND column_name = 'position'
    ) THEN
        ALTER TABLE public.competition_teams ADD COLUMN "position" INTEGER;
    END IF;
END $$;

-- Update RLS policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.competition_teams;
CREATE POLICY "Enable read access for all users" 
ON public.competition_teams FOR SELECT 
USING (true);

-- Add sample data if needed
DO $$
DECLARE
    v_competition_id UUID;
    v_team_ids UUID[];
    v_team_id UUID;
    v_position INTEGER := 1;
BEGIN
    -- Find an active competition
    SELECT id INTO v_competition_id 
    FROM public.competitions 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF v_competition_id IS NOT NULL THEN
        -- Get existing teams in competition
        SELECT ARRAY(
            SELECT team_id 
            FROM public.competition_teams 
            WHERE competition_id = v_competition_id
            ORDER BY COALESCE("position", 999), created_at
            LIMIT 12
        ) INTO v_team_ids;
        
        -- Update each team with sample stats
        FOREACH v_team_id IN ARRAY v_team_ids
        LOOP
            UPDATE public.competition_teams SET
                "position" = v_position,
                points = GREATEST(0, 90 - (v_position * 5) + floor(random() * 10)::INTEGER),
                matches_played = LEAST(38, v_position * 2 + floor(random() * 8)::INTEGER),
                wins = GREATEST(0, 25 - v_position + floor(random() * 5)::INTEGER),
                draws = floor(random() * 8)::INTEGER,
                losses = GREATEST(0, v_position - 1 + floor(random() * 5)::INTEGER),
                goals_for = GREATEST(0, 65 - v_position * 2 + floor(random() * 15)::INTEGER),
                goals_against = GREATEST(0, 25 + v_position + floor(random() * 10)::INTEGER)
            WHERE competition_id = v_competition_id AND team_id = v_team_id;
            
            -- Calculate goal difference
            UPDATE public.competition_teams 
            SET goal_difference = goals_for - goals_against
            WHERE competition_id = v_competition_id AND team_id = v_team_id;
            
            v_position := v_position + 1;
            
            EXIT WHEN v_position > 12;
        END LOOP;
    END IF;
END $$; 