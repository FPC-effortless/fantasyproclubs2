-- =============================================================================
-- FANTASY AUTHENTICATION FIX - EA FC Pro Clubs App
-- Date: 2024-12-20
-- Purpose: Fix fantasy system authentication and missing tables
-- =============================================================================

-- Step 1: Ensure competitions table has fantasy_enabled column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competitions' AND column_name = 'fantasy_enabled'
    ) THEN
        ALTER TABLE public.competitions ADD COLUMN fantasy_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Step 2: Create fantasy_teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budget DECIMAL(10,2) DEFAULT 100.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, competition_id)
);

-- Step 3: Create fantasy_team_players table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fantasy_team_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fantasy_team_id UUID REFERENCES public.fantasy_teams(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    position_in_team INTEGER NOT NULL CHECK (position_in_team BETWEEN 1 AND 15),
    is_captain BOOLEAN DEFAULT FALSE,
    is_vice_captain BOOLEAN DEFAULT FALSE,
    is_starting BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(fantasy_team_id, player_id),
    UNIQUE(fantasy_team_id, position_in_team)
);

-- Step 4: Create fantasy_player_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fantasy_player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    fantasy_points DECIMAL(10, 2) DEFAULT 0.0,
    fantasy_price DECIMAL(10, 2) DEFAULT 5.0,
    games_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, competition_id)
);

-- Step 5: Create fantasy_gameweeks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fantasy_gameweeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    gameweek_number INTEGER NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, gameweek_number)
);

-- Step 6: Enable Row Level Security on all fantasy tables
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_gameweeks ENABLE ROW LEVEL SECURITY;

-- Step 7: Ensure competitions table has RLS enabled
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "fantasy_teams_public_read" ON public.fantasy_teams;
DROP POLICY IF EXISTS "fantasy_teams_owner_full" ON public.fantasy_teams;
DROP POLICY IF EXISTS "fantasy_team_players_public_read" ON public.fantasy_team_players;
DROP POLICY IF EXISTS "fantasy_team_players_owner_full" ON public.fantasy_team_players;
DROP POLICY IF EXISTS "fantasy_player_stats_public_read" ON public.fantasy_player_stats;
DROP POLICY IF EXISTS "fantasy_gameweeks_public_read" ON public.fantasy_gameweeks;
DROP POLICY IF EXISTS "competitions_public_read" ON public.competitions;

-- Step 9: Create RLS policies for fantasy_teams
CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
    FOR SELECT USING (true);

CREATE POLICY "fantasy_teams_owner_full" ON public.fantasy_teams
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Step 10: Create RLS policies for fantasy_team_players
CREATE POLICY "fantasy_team_players_public_read" ON public.fantasy_team_players
    FOR SELECT USING (true);

CREATE POLICY "fantasy_team_players_owner_full" ON public.fantasy_team_players
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
            AND ft.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_team_players.fantasy_team_id
            AND ft.user_id = auth.uid()
        )
    );

-- Step 11: Create RLS policies for fantasy_player_stats
CREATE POLICY "fantasy_player_stats_public_read" ON public.fantasy_player_stats
    FOR SELECT USING (true);

-- Step 12: Create RLS policies for fantasy_gameweeks
CREATE POLICY "fantasy_gameweeks_public_read" ON public.fantasy_gameweeks
    FOR SELECT USING (true);

-- Step 13: Create RLS policies for competitions
CREATE POLICY "competitions_public_read" ON public.competitions
    FOR SELECT USING (true);

-- Step 14: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_competition_id ON public.fantasy_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_team_id ON public.fantasy_team_players(fantasy_team_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_player_id ON public.fantasy_team_players(player_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_player_stats_player_id ON public.fantasy_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_player_stats_competition_id ON public.fantasy_player_stats(competition_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_gameweeks_competition_id ON public.fantasy_gameweeks(competition_id);

-- Step 15: Create or replace update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 16: Add updated_at triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_fantasy_teams_updated_at') THEN
        CREATE TRIGGER set_fantasy_teams_updated_at
            BEFORE UPDATE ON public.fantasy_teams
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_fantasy_team_players_updated_at') THEN
        CREATE TRIGGER set_fantasy_team_players_updated_at
            BEFORE UPDATE ON public.fantasy_team_players
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_fantasy_player_stats_updated_at') THEN
        CREATE TRIGGER set_fantasy_player_stats_updated_at
            BEFORE UPDATE ON public.fantasy_player_stats
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_fantasy_gameweeks_updated_at') THEN
        CREATE TRIGGER set_fantasy_gameweeks_updated_at
            BEFORE UPDATE ON public.fantasy_gameweeks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Step 17: Update existing competitions to enable fantasy for leagues
UPDATE public.competitions 
SET fantasy_enabled = true 
WHERE fantasy_enabled = false 
AND type = 'league';

-- Step 18: Insert sample gameweeks for fantasy-enabled competitions
INSERT INTO public.fantasy_gameweeks (competition_id, gameweek_number, start_date, end_date, deadline, is_current)
SELECT 
    c.id,
    gs.gameweek_number,
    NOW() + (gs.gameweek_number - 1) * INTERVAL '1 week',
    NOW() + gs.gameweek_number * INTERVAL '1 week',
    NOW() + (gs.gameweek_number - 1) * INTERVAL '1 week' + INTERVAL '6 days 23 hours',
    gs.gameweek_number = 1
FROM public.competitions c
CROSS JOIN generate_series(1, 38) gs(gameweek_number)
WHERE c.fantasy_enabled = true
ON CONFLICT (competition_id, gameweek_number) DO NOTHING;

-- Success message
COMMENT ON SCHEMA public IS 'Fantasy authentication system has been fixed and all tables created!'; 