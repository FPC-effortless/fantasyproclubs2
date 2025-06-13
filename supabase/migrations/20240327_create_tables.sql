-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for auth
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    flag_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES auth.users(id),
    display_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    user_type TEXT DEFAULT 'fan',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    manager_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tag)
);

-- Create competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('league', 'cup', 'friendly')),
    status TEXT CHECK (status IN ('upcoming', 'active', 'completed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_teams INTEGER,
    entry_fee DECIMAL(10,2),
    prize_pool DECIMAL(10,2),
    rules TEXT,
    stream_link TEXT,
    logo_url TEXT,
    country_id UUID REFERENCES public.countries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id),
    team_id UUID REFERENCES public.teams(id),
    position TEXT NOT NULL,
    number INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, number)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id),
    home_team_id UUID REFERENCES public.teams(id),
    away_team_id UUID REFERENCES public.teams(id),
    match_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    venue TEXT,
    matchday INTEGER,
    home_team_stats JSONB DEFAULT '{}'::JSONB,
    away_team_stats JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fantasy_teams table
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id),
    competition_id UUID REFERENCES public.competitions(id),
    name TEXT NOT NULL,
    budget DECIMAL(10,2) DEFAULT 100.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id),
    type TEXT CHECK (type IN ('match', 'transfer', 'award', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transfers table
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id),
    from_team_id UUID REFERENCES public.teams(id),
    to_team_id UUID REFERENCES public.teams(id),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    transfer_fee DECIMAL(10,2),
    transfer_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create awards table
CREATE TABLE IF NOT EXISTS public.awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id),
    player_id UUID REFERENCES public.players(id),
    type TEXT CHECK (type IN ('player_of_the_month', 'top_scorer', 'best_goalkeeper', 'best_defender', 'best_midfielder', 'best_forward')),
    season TEXT NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create account_upgrade_requests table
CREATE TABLE IF NOT EXISTS public.account_upgrade_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id),
    requested_role TEXT CHECK (requested_role IN ('player', 'manager')),
    xbox_gamertag TEXT,
    psn_id TEXT,
    preferred_platform TEXT CHECK (preferred_platform IN ('xbox', 'playstation', 'both')),
    team_preference TEXT,
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    additional_info TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    category TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create featured_matches table
CREATE TABLE IF NOT EXISTS public.featured_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create competition_teams join table
CREATE TABLE IF NOT EXISTS public.competition_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT CHECK (status IN ('active', 'pending', 'suspended', 'withdrawn')) DEFAULT 'active',
    points INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    "position" INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, team_id)
);

-- Create indexes for competition_teams
CREATE INDEX IF NOT EXISTS idx_competition_teams_competition_id ON public.competition_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_teams_team_id ON public.competition_teams(team_id);

-- Enable RLS on competition_teams
ALTER TABLE public.competition_teams ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_competition_id ON public.matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON public.matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_player_id ON public.transfers(player_id);
CREATE INDEX IF NOT EXISTS idx_awards_competition_id ON public.awards(competition_id);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_featured_matches_match_id ON public.featured_matches(match_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$ language 'plpgsql';

-- Create RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_matches ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.user_profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Enable update for users based on id'
    ) THEN
        CREATE POLICY "Enable update for users based on id" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, username, full_name)
    VALUES (new.id, new.email, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ language 'plpgsql' security definer;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to update team standings after a match
CREATE OR REPLACE FUNCTION public.update_team_standings(
    match_id UUID,
    home_score INTEGER,
    away_score INTEGER
) RETURNS void AS $$
DECLARE
    v_competition_id UUID;
    v_home_team_id UUID;
    v_away_team_id UUID;
    v_home_points INTEGER;
    v_away_points INTEGER;
BEGIN
    -- Get match details
    SELECT 
        competition_id,
        home_team_id,
        away_team_id
    INTO 
        v_competition_id,
        v_home_team_id,
        v_away_team_id
    FROM public.matches
    WHERE id = match_id;

    -- Calculate points
    IF home_score > away_score THEN
        v_home_points := 3;
        v_away_points := 0;
    ELSIF home_score < away_score THEN
        v_home_points := 0;
        v_away_points := 3;
    ELSE
        v_home_points := 1;
        v_away_points := 1;
    END IF;

    -- Update home team stats
    UPDATE public.competition_teams
    SET 
        matches_played = matches_played + 1,
        wins = wins + CASE WHEN home_score > away_score THEN 1 ELSE 0 END,
        draws = draws + CASE WHEN home_score = away_score THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN home_score < away_score THEN 1 ELSE 0 END,
        goals_for = goals_for + home_score,
        goals_against = goals_against + away_score,
        goal_difference = (goals_for + home_score) - (goals_against + away_score),
        points = points + v_home_points
    WHERE competition_id = v_competition_id AND team_id = v_home_team_id;

    -- Update away team stats
    UPDATE public.competition_teams
    SET 
        matches_played = matches_played + 1,
        wins = wins + CASE WHEN away_score > home_score THEN 1 ELSE 0 END,
        draws = draws + CASE WHEN away_score = home_score THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN away_score < home_score THEN 1 ELSE 0 END,
        goals_for = goals_for + away_score,
        goals_against = goals_against + home_score,
        goal_difference = (goals_for + away_score) - (goals_against + home_score),
        points = points + v_away_points
    WHERE competition_id = v_competition_id AND team_id = v_away_team_id;

    -- Update positions in the league table
    WITH ranked_teams AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY competition_id 
                ORDER BY 
                    points DESC,
                    goal_difference DESC,
                    goals_for DESC,
                    wins DESC
            ) as new_position
        FROM public.competition_teams
        WHERE competition_id = v_competition_id
    )
    UPDATE public.competition_teams ct
    SET "position" = rt.new_position
    FROM ranked_teams rt
    WHERE ct.id = rt.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to add a team to a competition
CREATE OR REPLACE FUNCTION public.add_team_to_competition(
    p_team_id UUID,
    p_competition_id UUID
) RETURNS UUID AS $$
DECLARE
    v_team_count INTEGER;
    v_max_teams INTEGER;
    v_competition_status TEXT;
    v_new_entry_id UUID;
BEGIN
    -- Check if competition exists and is accepting teams
    SELECT status, max_teams
    INTO v_competition_status, v_max_teams
    FROM public.competitions
    WHERE id = p_competition_id;

    IF v_competition_status IS NULL THEN
        RAISE EXCEPTION 'Competition not found';
    END IF;

    IF v_competition_status = 'completed' THEN
        RAISE EXCEPTION 'Competition is already completed';
    END IF;

    -- Check team count if max_teams is set
    IF v_max_teams IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_team_count
        FROM public.competition_teams
        WHERE competition_id = p_competition_id;

        IF v_team_count >= v_max_teams THEN
            RAISE EXCEPTION 'Competition is full';
        END IF;
    END IF;

    -- Add team to competition
    INSERT INTO public.competition_teams (
        competition_id,
        team_id,
        status,
        "position"
    ) VALUES (
        p_competition_id,
        p_team_id,
        'active',
        v_team_count + 1
    )
    RETURNING id INTO v_new_entry_id;

    RETURN v_new_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get competition standings
CREATE OR REPLACE FUNCTION public.get_competition_standings(p_competition_id UUID)
RETURNS TABLE (
    team_position INTEGER,
    team_id UUID,
    team_name TEXT,
    matches_played INTEGER,
    wins INTEGER,
    draws INTEGER,
    losses INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_difference INTEGER,
    points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ct."position" as team_position,
        ct.team_id,
        t.name as team_name,
        ct.matches_played,
        ct.wins,
        ct.draws,
        ct.losses,
        ct.goals_for,
        ct.goals_against,
        ct.goal_difference,
        ct.points
    FROM public.competition_teams ct
    JOIN public.teams t ON t.id = ct.team_id
    WHERE ct.competition_id = p_competition_id
    ORDER BY 
        ct."position" ASC NULLS LAST,
        ct.points DESC,
        ct.goal_difference DESC,
        ct.goals_for DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for competition_teams
DO $$
BEGIN
    -- Allow read access for all authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'competition_teams' 
        AND policyname = 'Enable read access for all authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for all authenticated users" 
        ON public.competition_teams FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;

    -- Allow admins to manage teams in competitions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'competition_teams' 
        AND policyname = 'Enable full access for admins'
    ) THEN
        CREATE POLICY "Enable full access for admins" 
        ON public.competition_teams 
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE id = auth.uid()
                AND role = 'admin'
            )
        );
    END IF;

    -- Allow team managers to view their team's competitions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'competition_teams' 
        AND policyname = 'Enable read access for team managers'
    ) THEN
        CREATE POLICY "Enable read access for team managers" 
        ON public.competition_teams FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.teams
                WHERE id = competition_teams.team_id
                AND manager_id = auth.uid()
            )
        );
    END IF;
END $$; 