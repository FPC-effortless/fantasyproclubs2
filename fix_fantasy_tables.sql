-- =============================================================================
-- FANTASY SYSTEM TABLES FIX - EA FC Pro Clubs App
-- Run this in your Supabase SQL Editor to fix missing fantasy tables
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

-- Enable Row Level Security
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "fantasy_teams_public_read" ON public.fantasy_teams;
DROP POLICY IF EXISTS "fantasy_teams_owner_full" ON public.fantasy_teams;
DROP POLICY IF EXISTS "fantasy_team_players_public_read" ON public.fantasy_team_players;
DROP POLICY IF EXISTS "fantasy_team_players_owner_full" ON public.fantasy_team_players;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_competition_id ON public.fantasy_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_team_id ON public.fantasy_team_players(fantasy_team_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_team_players_player_id ON public.fantasy_team_players(player_id);

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
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
END
$$;

-- Add some sample fantasy teams for testing (optional)
DO $$
DECLARE
    competition_record RECORD;
    user_record RECORD;
BEGIN
    -- Get first fantasy-enabled competition
    SELECT id INTO competition_record FROM public.competitions WHERE fantasy_enabled = true LIMIT 1;
    
    IF competition_record.id IS NOT NULL THEN
        -- Get first few users to create sample fantasy teams
        FOR user_record IN 
            SELECT DISTINCT u.id 
            FROM auth.users u 
            JOIN public.user_profiles up ON u.id = up.id 
            LIMIT 5
        LOOP
            INSERT INTO public.fantasy_teams (user_id, competition_id, name, budget, points)
            VALUES (
                user_record.id,
                competition_record.id,
                'Team ' || SUBSTRING(user_record.id::text, 1, 8),
                ROUND(90 + RANDOM() * 20, 2), -- Random budget between 90-110
                FLOOR(RANDOM() * 500) -- Random points 0-500
            )
            ON CONFLICT (user_id, competition_id) DO NOTHING;
        END LOOP;
    END IF;
END
$$;

-- Success message
SELECT 'Fantasy system tables created successfully! You can now use the fantasy features.' as message;
