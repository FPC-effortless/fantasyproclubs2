-- Create lineups table
CREATE TABLE IF NOT EXISTS lineups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    formation VARCHAR(10) NOT NULL DEFAULT '4-3-3',
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- New deadline and verification fields
    submitted_at TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ,
    verification_status VARCHAR(20) DEFAULT 'draft' CHECK (verification_status IN ('draft', 'pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    admin_override_allowed BOOLEAN DEFAULT FALSE,
    kickoff_time TIMESTAMPTZ,
    match_name VARCHAR(255)
);

-- Create lineup_players table (supports both real players and AI)
CREATE TABLE IF NOT EXISTS lineup_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lineup_id UUID NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE, -- NULL for AI players
    position VARCHAR(10) NOT NULL, -- GK, CB, LB, RB, CM, LM, RM, LW, RW, ST
    player_order INTEGER NOT NULL, -- 1-11 for starting lineup
    is_ai_player BOOLEAN DEFAULT FALSE,
    ai_player_name VARCHAR(50) DEFAULT 'AI',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lineups_team_id ON lineups(team_id);
CREATE INDEX IF NOT EXISTS idx_lineups_match_id ON lineups(match_id);
CREATE INDEX IF NOT EXISTS idx_lineups_verification_status ON lineups(verification_status);
CREATE INDEX IF NOT EXISTS idx_lineups_submission_deadline ON lineups(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_lineup_players_lineup_id ON lineup_players(lineup_id);
CREATE INDEX IF NOT EXISTS idx_lineup_players_player_id ON lineup_players(player_id);

-- Add updated_at trigger for lineups
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_lineups_updated_at ON lineups;
CREATE TRIGGER update_lineups_updated_at
    BEFORE UPDATE ON lineups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set submission deadline based on match kickoff time
CREATE OR REPLACE FUNCTION set_lineup_submission_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- If kickoff_time is provided, set submission deadline to 3 hours before
    IF NEW.kickoff_time IS NOT NULL THEN
        NEW.submission_deadline = NEW.kickoff_time - INTERVAL '3 hours';
    END IF;
    
    -- If being submitted (submitted_at is set), update verification status
    IF NEW.submitted_at IS NOT NULL AND (OLD.submitted_at IS NULL OR OLD.submitted_at IS DISTINCT FROM NEW.submitted_at) THEN
        NEW.verification_status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_lineup_deadline ON lineups;
CREATE TRIGGER trigger_set_lineup_deadline
    BEFORE INSERT OR UPDATE ON lineups
    FOR EACH ROW
    EXECUTE FUNCTION set_lineup_submission_deadline();

-- Row Level Security for lineups
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_players ENABLE ROW LEVEL SECURITY;

-- Lineups policies
DROP POLICY IF EXISTS "lineups_select_policy" ON lineups;
CREATE POLICY "lineups_select_policy" ON lineups
FOR SELECT
USING (
    -- Admins can see all
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers and players can see their team's lineups
    EXISTS (
        SELECT 1 FROM players
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE players.team_id = lineups.team_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type IN ('manager', 'player')
    )
);

DROP POLICY IF EXISTS "lineups_insert_policy" ON lineups;
CREATE POLICY "lineups_insert_policy" ON lineups
FOR INSERT
WITH CHECK (
    -- Admins can create any lineup
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers can create lineups for their team
    EXISTS (
        SELECT 1 FROM players
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE players.team_id = lineups.team_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'manager'
    )
);

DROP POLICY IF EXISTS "lineups_update_policy" ON lineups;
CREATE POLICY "lineups_update_policy" ON lineups
FOR UPDATE
USING (
    -- Admins can update any lineup
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers can update their team's lineups if deadline hasn't passed or override is allowed
    EXISTS (
        SELECT 1 FROM players
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE players.team_id = lineups.team_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'manager'
        AND (
            lineups.submission_deadline IS NULL
            OR lineups.submission_deadline > NOW()
            OR lineups.admin_override_allowed = true
        )
    )
);

DROP POLICY IF EXISTS "lineups_delete_policy" ON lineups;
CREATE POLICY "lineups_delete_policy" ON lineups
FOR DELETE
USING (
    -- Admins can delete any lineup
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers can delete their team's lineups
    EXISTS (
        SELECT 1 FROM players
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE players.team_id = lineups.team_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'manager'
    )
);

-- Lineup players policies
DROP POLICY IF EXISTS "lineup_players_select_policy" ON lineup_players;
CREATE POLICY "lineup_players_select_policy" ON lineup_players
FOR SELECT
USING (
    -- Admins can see all
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers and players can see lineup players for their team's lineups
    EXISTS (
        SELECT 1 FROM lineups
        JOIN players ON players.team_id = lineups.team_id
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE lineups.id = lineup_players.lineup_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type IN ('manager', 'player')
    )
);

DROP POLICY IF EXISTS "lineup_players_insert_policy" ON lineup_players;
CREATE POLICY "lineup_players_insert_policy" ON lineup_players
FOR INSERT
WITH CHECK (
    -- Admins can insert any lineup player
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers can insert lineup players for their team's lineups
    EXISTS (
        SELECT 1 FROM lineups
        JOIN players ON players.team_id = lineups.team_id
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE lineups.id = lineup_players.lineup_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'manager'
    )
);

DROP POLICY IF EXISTS "lineup_players_update_policy" ON lineup_players;
CREATE POLICY "lineup_players_update_policy" ON lineup_players
FOR UPDATE
USING (
    -- Admins can update any lineup player
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers can update lineup players for their team's lineups
    EXISTS (
        SELECT 1 FROM lineups
        JOIN players ON players.team_id = lineups.team_id
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE lineups.id = lineup_players.lineup_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'manager'
    )
);

DROP POLICY IF EXISTS "lineup_players_delete_policy" ON lineup_players;
CREATE POLICY "lineup_players_delete_policy" ON lineup_players
FOR DELETE
USING (
    -- Admins can delete any lineup player
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
    OR
    -- Managers can delete lineup players for their team's lineups
    EXISTS (
        SELECT 1 FROM lineups
        JOIN players ON players.team_id = lineups.team_id
        JOIN user_profiles ON user_profiles.id = players.user_id
        WHERE lineups.id = lineup_players.lineup_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'manager'
    )
);

-- Insert some sample data if teams exist
DO $$
BEGIN
    -- Only insert sample data if teams table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') AND 
       EXISTS (SELECT 1 FROM teams LIMIT 1) THEN
        
        -- Insert a sample default lineup for each team
        INSERT INTO lineups (team_id, formation, name, is_default)
        SELECT id, '4-3-3', 'Default Formation', true
        FROM teams
        WHERE NOT EXISTS (
            SELECT 1 FROM lineups WHERE lineups.team_id = teams.id AND is_default = true
        );
        
        RAISE NOTICE 'Sample lineup data inserted for existing teams';
    ELSE
        RAISE NOTICE 'No teams found, skipping sample lineup data insertion';
    END IF;
END
$$; 