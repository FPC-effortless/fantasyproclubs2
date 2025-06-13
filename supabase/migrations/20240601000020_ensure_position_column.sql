-- Ensure the position column exists and is properly set up
-- This migration fixes the database issue for fantasy page

-- Add position column if it doesn't exist (this should already exist but adding for safety)
ALTER TABLE public.competition_teams 
ADD COLUMN IF NOT EXISTS "position" INTEGER;

-- Update RLS policy to ensure position is readable
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.competition_teams;

CREATE POLICY "Enable read access for all authenticated users" 
ON public.competition_teams FOR SELECT 
USING (auth.role() = 'authenticated');

-- Insert sample competition teams data with positions for testing
DO $$ 
DECLARE
    v_competition_id UUID;
    v_team_ids UUID[];
    v_team_id UUID;
    v_position INTEGER := 1;
BEGIN
    -- Get the first competition ID
    SELECT id INTO v_competition_id 
    FROM public.competitions 
    WHERE status = 'active' 
    LIMIT 1;
    
    IF v_competition_id IS NOT NULL THEN
        -- Get team IDs
        SELECT ARRAY(SELECT id FROM public.teams LIMIT 12) INTO v_team_ids;
        
        -- Clear existing teams for this competition
        DELETE FROM public.competition_teams WHERE competition_id = v_competition_id;
        
        -- Add teams with positions and sample stats
        FOREACH v_team_id IN ARRAY v_team_ids
        LOOP
            INSERT INTO public.competition_teams (
                competition_id,
                team_id,
                status,
                "position",
                points,
                matches_played,
                wins,
                draws,
                losses,
                goals_for,
                goals_against,
                goal_difference
            ) VALUES (
                v_competition_id,
                v_team_id,
                'active',
                v_position,
                GREATEST(0, 90 - (v_position * 5) + (RANDOM() * 10)::INTEGER),  -- Points decreasing by position
                LEAST(38, v_position * 3 + (RANDOM() * 5)::INTEGER),  -- Matches played
                GREATEST(0, 25 - v_position + (RANDOM() * 5)::INTEGER),  -- Wins
                (RANDOM() * 8)::INTEGER,  -- Draws
                GREATEST(0, v_position + (RANDOM() * 5)::INTEGER),  -- Losses
                GREATEST(0, 65 - v_position * 2 + (RANDOM() * 15)::INTEGER),  -- Goals for
                GREATEST(0, 25 + v_position + (RANDOM() * 10)::INTEGER),  -- Goals against
                0  -- Will be calculated
            );
            
            -- Update goal difference
            UPDATE public.competition_teams 
            SET goal_difference = goals_for - goals_against
            WHERE competition_id = v_competition_id AND team_id = v_team_id;
            
            v_position := v_position + 1;
            
            EXIT WHEN v_position > 12;
        END LOOP;
    END IF;
END $$; 