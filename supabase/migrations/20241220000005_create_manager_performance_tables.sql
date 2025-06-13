-- Create manager performance tracking tables

-- Manager career statistics table
CREATE TABLE IF NOT EXISTS public.manager_career_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Career totals
    total_matches INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_draws INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_goals_for INTEGER DEFAULT 0,
    total_goals_against INTEGER DEFAULT 0,
    total_trophies INTEGER DEFAULT 0,
    
    -- Career averages
    win_percentage DECIMAL(5,2) DEFAULT 0,
    goals_per_match DECIMAL(4,2) DEFAULT 0,
    goals_conceded_per_match DECIMAL(4,2) DEFAULT 0,
    
    -- Career milestones
    first_match_date TIMESTAMPTZ,
    last_match_date TIMESTAMPTZ,
    longest_winning_streak INTEGER DEFAULT 0,
    longest_unbeaten_streak INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(manager_id)
);

-- Manager season statistics table
CREATE TABLE IF NOT EXISTS public.manager_season_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    season TEXT NOT NULL,
    
    -- Season stats
    matches_managed INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_scored INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    
    -- Performance metrics
    win_percentage DECIMAL(5,2) DEFAULT 0,
    points_per_match DECIMAL(4,2) DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    
    -- League position
    final_position INTEGER,
    points_total INTEGER DEFAULT 0,
    
    -- Achievements
    trophies_won INTEGER DEFAULT 0,
    cups_won INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(manager_id, competition_id, season)
);

-- Manager match records table (for detailed match history)
CREATE TABLE IF NOT EXISTS public.manager_match_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    
    -- Match result from manager's perspective
    result TEXT CHECK (result IN ('win', 'draw', 'loss')),
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    clean_sheet BOOLEAN DEFAULT FALSE,
    
    -- Tactical info
    formation_used TEXT,
    substitutions_made INTEGER DEFAULT 0,
    tactical_changes INTEGER DEFAULT 0,
    
    -- Performance rating
    performance_rating DECIMAL(3,1),
    post_match_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(manager_id, match_id)
);

-- Manager achievements table
CREATE TABLE IF NOT EXISTS public.manager_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN (
        'league_title', 'cup_winner', 'promotion', 'unbeaten_streak', 
        'top_scorer_team', 'best_defense', 'manager_of_month', 'manager_of_season'
    )),
    achievement_name TEXT NOT NULL,
    description TEXT,
    
    -- Context
    competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    season TEXT,
    date_achieved TIMESTAMPTZ NOT NULL,
    
    -- Achievement value (e.g., streak length, goals scored, etc.)
    achievement_value INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_manager_career_stats_manager_id ON public.manager_career_stats(manager_id);
CREATE INDEX idx_manager_season_stats_manager_id ON public.manager_season_stats(manager_id);
CREATE INDEX idx_manager_season_stats_competition ON public.manager_season_stats(competition_id);
CREATE INDEX idx_manager_season_stats_season ON public.manager_season_stats(season);
CREATE INDEX idx_manager_match_records_manager_id ON public.manager_match_records(manager_id);
CREATE INDEX idx_manager_match_records_match_id ON public.manager_match_records(match_id);
CREATE INDEX idx_manager_achievements_manager_id ON public.manager_achievements(manager_id);
CREATE INDEX idx_manager_achievements_type ON public.manager_achievements(achievement_type);
CREATE INDEX idx_manager_achievements_date ON public.manager_achievements(date_achieved);

-- Enable RLS
ALTER TABLE public.manager_career_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_match_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "manager_stats_public_read" ON public.manager_career_stats
    FOR SELECT USING (true);

CREATE POLICY "manager_season_stats_public_read" ON public.manager_season_stats
    FOR SELECT USING (true);

CREATE POLICY "manager_match_records_public_read" ON public.manager_match_records
    FOR SELECT USING (true);

CREATE POLICY "manager_achievements_public_read" ON public.manager_achievements
    FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "manager_stats_admin_manage" ON public.manager_career_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "manager_season_stats_admin_manage" ON public.manager_season_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "manager_match_records_admin_manage" ON public.manager_match_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "manager_achievements_admin_manage" ON public.manager_achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_manager_career_stats_updated_at
    BEFORE UPDATE ON public.manager_career_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_manager_season_stats_updated_at
    BEFORE UPDATE ON public.manager_season_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_manager_match_records_updated_at
    BEFORE UPDATE ON public.manager_match_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_manager_achievements_updated_at
    BEFORE UPDATE ON public.manager_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 