-- Create tournament and Swiss system tables

-- Tournament rounds table (for cup competitions)
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER NOT NULL,
    round_name TEXT NOT NULL, -- e.g., "Round of 16", "Quarter-finals", "Semi-finals", "Final"
    round_type TEXT DEFAULT 'elimination' CHECK (round_type IN ('elimination', 'group', 'league')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, round_number)
);

-- Swiss model configurations (enhanced version)
CREATE TABLE IF NOT EXISTS public.swiss_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic Swiss settings
    number_of_rounds INTEGER NOT NULL,
    teams_per_match INTEGER DEFAULT 2,
    points_for_win DECIMAL(3,1) DEFAULT 3.0,
    points_for_draw DECIMAL(3,1) DEFAULT 1.0,
    points_for_loss DECIMAL(3,1) DEFAULT 0.0,
    
    -- Pairing rules
    allow_repeat_pairings BOOLEAN DEFAULT FALSE,
    color_balance BOOLEAN DEFAULT TRUE, -- For home/away balance
    same_country_restriction BOOLEAN DEFAULT FALSE,
    
    -- Qualification settings
    direct_qualifiers INTEGER DEFAULT 8,
    playoff_qualifiers INTEGER DEFAULT 0,
    elimination_threshold INTEGER, -- Teams eliminated after X losses
    
    -- Tiebreakers (in order of priority)
    tiebreakers TEXT[] DEFAULT ARRAY['points', 'head_to_head', 'goal_difference', 'goals_scored'],
    
    -- Advanced settings
    byes_allowed BOOLEAN DEFAULT TRUE,
    late_entry_allowed BOOLEAN DEFAULT FALSE,
    late_entry_deadline TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id)
);

-- Swiss round pairings table
CREATE TABLE IF NOT EXISTS public.swiss_pairings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER NOT NULL,
    pairing_number INTEGER NOT NULL,
    
    -- Teams
    team1_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    team2_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    
    -- Pairing details
    team1_color TEXT DEFAULT 'home', -- home/away for this pairing
    is_bye BOOLEAN DEFAULT FALSE, -- If one team gets a bye
    
    -- Result
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    team1_score INTEGER,
    team2_score INTEGER,
    result TEXT CHECK (result IN ('team1_win', 'team2_win', 'draw', 'pending')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, round_number, pairing_number)
);

-- Tournament brackets table (for knockout tournaments)
CREATE TABLE IF NOT EXISTS public.tournament_brackets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    round_id UUID REFERENCES public.tournament_rounds(id) ON DELETE CASCADE NOT NULL,
    bracket_position INTEGER NOT NULL, -- Position in the bracket
    
    -- Teams
    team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    
    -- Match details
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    
    -- Bracket progression
    advances_to_bracket_id UUID REFERENCES public.tournament_brackets(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competition rules table (for detailed rules and regulations)
CREATE TABLE IF NOT EXISTS public.competition_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    rule_category TEXT NOT NULL, -- e.g., 'eligibility', 'format', 'conduct', 'technical'
    rule_title TEXT NOT NULL,
    rule_content TEXT NOT NULL,
    rule_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competition officials table (referees, administrators, etc.)
CREATE TABLE IF NOT EXISTS public.competition_officials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('referee', 'administrator', 'observer', 'coordinator')),
    is_active BOOLEAN DEFAULT TRUE,
    appointed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, user_id, role)
);

-- Match officials table (for individual matches)
CREATE TABLE IF NOT EXISTS public.match_officials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('referee', 'assistant_referee', 'observer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(match_id, user_id, role)
);

-- Create indexes for performance
CREATE INDEX idx_tournament_rounds_competition_id ON public.tournament_rounds(competition_id);
CREATE INDEX idx_tournament_rounds_round_number ON public.tournament_rounds(round_number);
CREATE INDEX idx_swiss_model_configs_competition_id ON public.swiss_model_configs(competition_id);
CREATE INDEX idx_swiss_pairings_competition_round ON public.swiss_pairings(competition_id, round_number);
CREATE INDEX idx_swiss_pairings_teams ON public.swiss_pairings(team1_id, team2_id);
CREATE INDEX idx_tournament_brackets_competition_id ON public.tournament_brackets(competition_id);
CREATE INDEX idx_tournament_brackets_round_id ON public.tournament_brackets(round_id);
CREATE INDEX idx_competition_rules_competition_id ON public.competition_rules(competition_id);
CREATE INDEX idx_competition_rules_category ON public.competition_rules(rule_category);
CREATE INDEX idx_competition_officials_competition_id ON public.competition_officials(competition_id);
CREATE INDEX idx_match_officials_match_id ON public.match_officials(match_id);

-- Enable RLS
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swiss_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swiss_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_officials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read, admin manage for most)
CREATE POLICY "tournament_data_public_read" ON public.tournament_rounds
    FOR SELECT USING (true);

CREATE POLICY "swiss_configs_public_read" ON public.swiss_model_configs
    FOR SELECT USING (true);

CREATE POLICY "swiss_pairings_public_read" ON public.swiss_pairings
    FOR SELECT USING (true);

CREATE POLICY "tournament_brackets_public_read" ON public.tournament_brackets
    FOR SELECT USING (true);

CREATE POLICY "competition_rules_public_read" ON public.competition_rules
    FOR SELECT USING (is_active = true);

CREATE POLICY "competition_officials_public_read" ON public.competition_officials
    FOR SELECT USING (is_active = true);

CREATE POLICY "match_officials_public_read" ON public.match_officials
    FOR SELECT USING (true);

-- Admin management policies
CREATE POLICY "tournament_data_admin_manage" ON public.tournament_rounds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

CREATE POLICY "swiss_configs_admin_manage" ON public.swiss_model_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

CREATE POLICY "swiss_pairings_admin_manage" ON public.swiss_pairings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_tournament_rounds_updated_at
    BEFORE UPDATE ON public.tournament_rounds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_swiss_model_configs_updated_at
    BEFORE UPDATE ON public.swiss_model_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_swiss_pairings_updated_at
    BEFORE UPDATE ON public.swiss_pairings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_tournament_brackets_updated_at
    BEFORE UPDATE ON public.tournament_brackets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_competition_rules_updated_at
    BEFORE UPDATE ON public.competition_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_competition_officials_updated_at
    BEFORE UPDATE ON public.competition_officials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 