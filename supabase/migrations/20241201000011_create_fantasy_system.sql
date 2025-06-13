-- =============================================================================
-- FANTASY SYSTEM TABLES - EA FC Pro Clubs App
-- Date: 2024-12-01
-- =============================================================================

-- Create fantasy_teams table if it doesn't exist
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

-- Create fantasy_team_players table (junction table for team composition)
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

-- Ensure fantasy_player_stats table exists
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

-- Create fantasy_transfers table
CREATE TABLE IF NOT EXISTS public.fantasy_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fantasy_team_id UUID REFERENCES public.fantasy_teams(id) ON DELETE CASCADE NOT NULL,
    player_out_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    player_in_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    gameweek INTEGER NOT NULL DEFAULT 1,
    transfer_cost DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fantasy_gameweeks table
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

-- Enable Row Level Security
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_gameweeks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for fantasy_teams
CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
    FOR SELECT USING (true);

CREATE POLICY "fantasy_teams_owner_full" ON public.fantasy_teams
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for fantasy_team_players
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

-- Create RLS Policies for fantasy_player_stats
CREATE POLICY "fantasy_player_stats_public_read" ON public.fantasy_player_stats
    FOR SELECT USING (true);

CREATE POLICY "fantasy_player_stats_admin_full" ON public.fantasy_player_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

-- Create RLS Policies for fantasy_transfers
CREATE POLICY "fantasy_transfers_owner_read" ON public.fantasy_transfers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_transfers.fantasy_team_id
            AND ft.user_id = auth.uid()
        )
    );

CREATE POLICY "fantasy_transfers_owner_create" ON public.fantasy_transfers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.fantasy_teams ft
            WHERE ft.id = fantasy_transfers.fantasy_team_id
            AND ft.user_id = auth.uid()
        )
    );

-- Create RLS Policies for fantasy_gameweeks
CREATE POLICY "fantasy_gameweeks_public_read" ON public.fantasy_gameweeks
    FOR SELECT USING (true);

CREATE POLICY "fantasy_gameweeks_admin_full" ON public.fantasy_gameweeks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_competition_id ON public.fantasy_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_team_id ON public.fantasy_team_players(fantasy_team_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_player_id ON public.fantasy_team_players(player_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_player_stats_player_id ON public.fantasy_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_player_stats_competition_id ON public.fantasy_player_stats(competition_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_transfers_team_id ON public.fantasy_transfers(fantasy_team_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_gameweeks_competition_id ON public.fantasy_gameweeks(competition_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_gameweeks_current ON public.fantasy_gameweeks(is_current) WHERE is_current = true;

-- Add updated_at triggers
CREATE TRIGGER set_fantasy_teams_updated_at
    BEFORE UPDATE ON public.fantasy_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_fantasy_team_players_updated_at
    BEFORE UPDATE ON public.fantasy_team_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_fantasy_player_stats_updated_at
    BEFORE UPDATE ON public.fantasy_player_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_fantasy_transfers_updated_at
    BEFORE UPDATE ON public.fantasy_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_fantasy_gameweeks_updated_at
    BEFORE UPDATE ON public.fantasy_gameweeks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample fantasy gameweeks for existing competitions
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