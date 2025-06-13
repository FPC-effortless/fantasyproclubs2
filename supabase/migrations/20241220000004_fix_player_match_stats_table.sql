-- Fix and standardize player_match_stats table
-- Drop the old table and recreate with consistent structure

DROP TABLE IF EXISTS public.player_match_stats CASCADE;

-- Create standardized player_match_stats table
CREATE TABLE public.player_match_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    
    -- Basic stats
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    rating DECIMAL(3,1),
    
    -- Goalkeeper stats
    saves INTEGER DEFAULT 0,
    clean_sheet BOOLEAN DEFAULT FALSE,
    penalty_saves INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    
    -- Disciplinary
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    fouls_committed INTEGER DEFAULT 0,
    fouls_suffered INTEGER DEFAULT 0,
    
    -- Advanced stats
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    passes_completed INTEGER DEFAULT 0,
    passes_attempted INTEGER DEFAULT 0,
    tackles INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    dribbles_successful INTEGER DEFAULT 0,
    dribbles_attempted INTEGER DEFAULT 0,
    
    -- Fantasy specific
    fantasy_points DECIMAL(10,2) DEFAULT 0,
    own_goals INTEGER DEFAULT 0,
    penalty_misses INTEGER DEFAULT 0,
    motm BOOLEAN DEFAULT FALSE,
    
    -- Status and verification
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(match_id, player_id)
);

-- Create indexes for performance
CREATE INDEX idx_player_match_stats_match_id ON public.player_match_stats(match_id);
CREATE INDEX idx_player_match_stats_player_id ON public.player_match_stats(player_id);
CREATE INDEX idx_player_match_stats_team_id ON public.player_match_stats(team_id);
CREATE INDEX idx_player_match_stats_competition_id ON public.player_match_stats(competition_id);
CREATE INDEX idx_player_match_stats_status ON public.player_match_stats(status);

-- Enable RLS
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "player_match_stats_public_read" ON public.player_match_stats
    FOR SELECT USING (true);

CREATE POLICY "player_match_stats_player_submit" ON public.player_match_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.players
            WHERE players.id = player_match_stats.player_id
            AND players.user_id = auth.uid()
        )
    );

CREATE POLICY "player_match_stats_admin_manage" ON public.player_match_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Add updated_at trigger
CREATE TRIGGER set_player_match_stats_updated_at
    BEFORE UPDATE ON public.player_match_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate fantasy points
CREATE OR REPLACE FUNCTION public.calculate_fantasy_points()
RETURNS TRIGGER AS $$
DECLARE
    v_position TEXT;
    v_points DECIMAL(10,2) := 0;
BEGIN
    -- Get player position
    SELECT position INTO v_position
    FROM public.players
    WHERE id = NEW.player_id;

    -- Base points for appearing
    IF NEW.minutes_played > 0 THEN
        v_points := v_points + CASE 
            WHEN NEW.minutes_played >= 60 THEN 2
            ELSE 1
        END;
    END IF;

    -- Goal points by position
    v_points := v_points + CASE v_position
        WHEN 'GK' THEN (NEW.goals * 10)
        WHEN 'DEF' THEN (NEW.goals * 6)
        WHEN 'MID' THEN (NEW.goals * 5)
        WHEN 'FWD' THEN (NEW.goals * 4)
        ELSE (NEW.goals * 4)
    END;

    -- Assist points
    v_points := v_points + (NEW.assists * 3);

    -- Clean sheet points
    IF NEW.clean_sheet THEN
        v_points := v_points + CASE v_position
            WHEN 'GK' THEN 6
            WHEN 'DEF' THEN 4
            WHEN 'MID' THEN 2
            ELSE 0
        END;
    END IF;

    -- Goalkeeper saves
    IF v_position = 'GK' THEN
        v_points := v_points + (NEW.saves * 0.5);
        v_points := v_points + (NEW.penalty_saves * 5);
        -- Goals conceded penalty
        v_points := v_points - (NEW.goals_conceded * 0.5);
    END IF;

    -- Disciplinary
    v_points := v_points - (NEW.yellow_cards * 1);
    v_points := v_points - (NEW.red_cards * 3);
    v_points := v_points - (NEW.own_goals * 2);
    v_points := v_points - (NEW.penalty_misses * 2);

    -- Man of the match
    IF NEW.motm THEN
        v_points := v_points + 3;
    END IF;

    -- Rating bonus
    IF NEW.rating IS NOT NULL THEN
        v_points := v_points + CASE
            WHEN NEW.rating >= 9.0 THEN 3
            WHEN NEW.rating >= 8.0 THEN 2
            WHEN NEW.rating >= 7.0 THEN 1
            ELSE 0
        END;
    END IF;

    NEW.fantasy_points := v_points;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for fantasy points calculation
CREATE TRIGGER calculate_fantasy_points_trigger
    BEFORE INSERT OR UPDATE ON public.player_match_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_fantasy_points(); 