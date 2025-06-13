-- Create advanced features tables

-- Player injuries and fitness table
CREATE TABLE IF NOT EXISTS public.player_injuries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    injury_type TEXT NOT NULL, -- e.g., 'muscle', 'joint', 'concussion', 'fatigue'
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'season_ending')),
    description TEXT NOT NULL,
    
    -- Injury timeline
    injury_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_return_date TIMESTAMPTZ,
    actual_return_date TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'cleared', 'setback')),
    treatment_notes TEXT,
    
    -- Related to match if injury occurred during play
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    minute_occurred INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Player suspensions table
CREATE TABLE IF NOT EXISTS public.player_suspensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    suspension_type TEXT CHECK (suspension_type IN ('yellow_card_accumulation', 'red_card', 'misconduct', 'administrative')),
    
    -- Suspension details
    matches_suspended INTEGER NOT NULL DEFAULT 1,
    matches_served INTEGER DEFAULT 0,
    fine_amount DECIMAL(10,2),
    
    -- Timeline
    incident_date TIMESTAMPTZ NOT NULL,
    suspension_start_date TIMESTAMPTZ NOT NULL,
    suspension_end_date TIMESTAMPTZ,
    
    -- Related match if incident occurred during play
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'served', 'appealed', 'overturned')),
    appeal_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team training sessions table
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    session_type TEXT CHECK (session_type IN ('tactical', 'fitness', 'technical', 'match_preparation', 'recovery')),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Session details
    session_date TIMESTAMPTZ NOT NULL,
    duration INTEGER, -- in minutes
    venue TEXT,
    intensity TEXT CHECK (intensity IN ('light', 'moderate', 'high', 'maximum')),
    
    -- Tactical focus
    formation_practiced TEXT,
    tactical_focus TEXT[], -- array of focus areas
    
    -- Attendance
    required_attendance BOOLEAN DEFAULT TRUE,
    
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training session attendance table
CREATE TABLE IF NOT EXISTS public.training_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    
    attendance_status TEXT CHECK (attendance_status IN ('present', 'absent', 'late', 'excused', 'injured')),
    minutes_participated INTEGER DEFAULT 0,
    performance_rating DECIMAL(3,1) CHECK (performance_rating >= 1.0 AND performance_rating <= 10.0),
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(training_session_id, player_id)
);

-- Team tactics and formations table
CREATE TABLE IF NOT EXISTS public.team_tactics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    tactic_name TEXT NOT NULL,
    formation TEXT NOT NULL, -- e.g., "4-3-3", "4-4-2"
    
    -- Tactical instructions
    attacking_style TEXT, -- e.g., "possession", "counter", "direct"
    defensive_style TEXT, -- e.g., "high_press", "mid_block", "low_block"
    pressing_intensity TEXT CHECK (pressing_intensity IN ('low', 'medium', 'high', 'ultra')),
    tempo TEXT CHECK (tempo IN ('slow', 'medium', 'fast')),
    width TEXT CHECK (width IN ('narrow', 'balanced', 'wide')),
    
    -- Player instructions (JSONB for flexibility)
    player_instructions JSONB DEFAULT '{}'::JSONB,
    set_piece_instructions JSONB DEFAULT '{}'::JSONB,
    
    -- Usage
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    matches_used INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Match tactical analysis table
CREATE TABLE IF NOT EXISTS public.match_tactical_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    analyst_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    
    -- Pre-match analysis
    expected_formation TEXT,
    tactical_approach TEXT,
    key_battles TEXT[],
    predicted_weaknesses TEXT[],
    
    -- Post-match analysis
    actual_formation TEXT,
    formations_used TEXT[], -- if multiple formations were used
    tactical_changes TEXT[],
    key_moments JSONB, -- tactical moments with timestamps
    
    -- Performance analysis
    possession_zones JSONB, -- heatmap data
    passing_network JSONB, -- passing connections
    defensive_actions JSONB, -- tackles, interceptions by zones
    
    -- Ratings and summary
    tactical_rating DECIMAL(3,1),
    summary TEXT,
    improvements_suggested TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);

-- Player development tracking table
CREATE TABLE IF NOT EXISTS public.player_development (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    season TEXT NOT NULL,
    
    -- Skill assessments (1-100 scale)
    technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 100),
    tactical_awareness INTEGER CHECK (tactical_awareness >= 1 AND tactical_awareness <= 100),
    physical_attributes INTEGER CHECK (physical_attributes >= 1 AND physical_attributes <= 100),
    mental_strength INTEGER CHECK (mental_strength >= 1 AND mental_strength <= 100),
    
    -- Position-specific skills
    position_specific_skills JSONB DEFAULT '{}'::JSONB,
    
    -- Development goals
    development_goals TEXT[],
    training_focus TEXT[],
    weaknesses_identified TEXT[],
    
    -- Progress tracking
    assessment_date TIMESTAMPTZ NOT NULL,
    assessor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scout reports table
CREATE TABLE IF NOT EXISTS public.scout_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scout_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    target_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- team interested in player
    
    -- Report details
    report_type TEXT CHECK (report_type IN ('player_assessment', 'opposition_analysis', 'transfer_target')),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL, -- if based on specific match
    
    -- Assessment
    overall_rating DECIMAL(3,1) CHECK (overall_rating >= 1.0 AND overall_rating <= 10.0),
    strengths TEXT[],
    weaknesses TEXT[],
    potential_rating DECIMAL(3,1) CHECK (potential_rating >= 1.0 AND potential_rating <= 10.0),
    
    -- Detailed analysis
    technical_report TEXT,
    tactical_report TEXT,
    physical_report TEXT,
    mental_report TEXT,
    
    -- Recommendations
    transfer_recommendation TEXT CHECK (transfer_recommendation IN ('highly_recommend', 'recommend', 'consider', 'do_not_recommend')),
    estimated_value DECIMAL(12,2),
    priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    
    -- Metadata
    is_confidential BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_player_injuries_player_id ON public.player_injuries(player_id);
CREATE INDEX idx_player_injuries_status ON public.player_injuries(status);
CREATE INDEX idx_player_suspensions_player_id ON public.player_suspensions(player_id);
CREATE INDEX idx_player_suspensions_status ON public.player_suspensions(status);
CREATE INDEX idx_training_sessions_team_id ON public.training_sessions(team_id);
CREATE INDEX idx_training_sessions_date ON public.training_sessions(session_date);
CREATE INDEX idx_training_attendance_session_id ON public.training_attendance(training_session_id);
CREATE INDEX idx_team_tactics_team_id ON public.team_tactics(team_id);
CREATE INDEX idx_team_tactics_active ON public.team_tactics(is_active);
CREATE INDEX idx_match_tactical_analysis_match_id ON public.match_tactical_analysis(match_id);
CREATE INDEX idx_player_development_player_id ON public.player_development(player_id);
CREATE INDEX idx_scout_reports_scout_id ON public.scout_reports(scout_id);
CREATE INDEX idx_scout_reports_player_id ON public.scout_reports(player_id);

-- Enable RLS
ALTER TABLE public.player_injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_tactical_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_reports ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (public read for most, team-specific for sensitive data)
CREATE POLICY "player_injuries_public_read" ON public.player_injuries
    FOR SELECT USING (true);

CREATE POLICY "player_suspensions_public_read" ON public.player_suspensions
    FOR SELECT USING (true);

CREATE POLICY "training_sessions_team_read" ON public.training_sessions
    FOR SELECT USING (
        team_id IN (
            SELECT p.team_id FROM public.players p
            WHERE p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "scout_reports_restricted" ON public.scout_reports
    FOR SELECT USING (
        NOT is_confidential OR
        scout_id = auth.uid() OR
        target_team_id IN (
            SELECT p.team_id FROM public.players p
            WHERE p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Admin policies for all tables
CREATE POLICY "injuries_admin_manage" ON public.player_injuries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "suspensions_admin_manage" ON public.player_suspensions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_player_injuries_updated_at
    BEFORE UPDATE ON public.player_injuries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_player_suspensions_updated_at
    BEFORE UPDATE ON public.player_suspensions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_training_sessions_updated_at
    BEFORE UPDATE ON public.training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_training_attendance_updated_at
    BEFORE UPDATE ON public.training_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_team_tactics_updated_at
    BEFORE UPDATE ON public.team_tactics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_match_tactical_analysis_updated_at
    BEFORE UPDATE ON public.match_tactical_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_player_development_updated_at
    BEFORE UPDATE ON public.player_development
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_scout_reports_updated_at
    BEFORE UPDATE ON public.scout_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 