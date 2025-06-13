-- Create match_events table
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card', 'substitution', 'penalty', 'own_goal')),
    minute INTEGER NOT NULL,
    player_id UUID REFERENCES public.players(id),
    team_id UUID REFERENCES public.teams(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create match_statistics table
CREATE TABLE IF NOT EXISTS public.match_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id),
    possession INTEGER CHECK (possession BETWEEN 0 AND 100),
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    corners INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    offsides INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    pass_accuracy INTEGER CHECK (pass_accuracy BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON public.match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_match_events_team_id ON public.match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON public.match_statistics(match_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_team_id ON public.match_statistics(team_id);

-- Enable RLS
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- Allow read access for all authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_events' 
        AND policyname = 'Enable read access for all authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for all authenticated users" 
        ON public.match_events FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_statistics' 
        AND policyname = 'Enable read access for all authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for all authenticated users" 
        ON public.match_statistics FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;

    -- Allow admins to manage match events and statistics
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_events' 
        AND policyname = 'Enable full access for admins'
    ) THEN
        CREATE POLICY "Enable full access for admins" 
        ON public.match_events 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE id = auth.uid()
                AND user_type = 'admin'
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_statistics' 
        AND policyname = 'Enable full access for admins'
    ) THEN
        CREATE POLICY "Enable full access for admins" 
        ON public.match_statistics 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE id = auth.uid()
                AND user_type = 'admin'
            )
        );
    END IF;
END $$; 