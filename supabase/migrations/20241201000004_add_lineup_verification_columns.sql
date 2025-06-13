-- Add verification and deadline management columns to lineups table
ALTER TABLE IF EXISTS lineups
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'draft' CHECK (verification_status IN ('draft', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_override_allowed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kickoff_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS match_name VARCHAR(255);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_lineups_verification_status ON lineups(verification_status);
CREATE INDEX IF NOT EXISTS idx_lineups_submission_deadline ON lineups(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_lineups_team_match ON lineups(team_id, match_id);

-- Update RLS policies for lineups table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "lineups_select_policy" ON lineups;
    DROP POLICY IF EXISTS "lineups_insert_policy" ON lineups;
    DROP POLICY IF EXISTS "lineups_update_policy" ON lineups;
    DROP POLICY IF EXISTS "lineups_delete_policy" ON lineups;

    -- Managers can view their team's lineups
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
        -- Managers can see their team's lineups
        EXISTS (
            SELECT 1 FROM players
            JOIN user_profiles ON user_profiles.id = players.user_id
            WHERE players.team_id = lineups.team_id
            AND user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'manager'
        )
        OR
        -- Players can see their team's lineups
        EXISTS (
            SELECT 1 FROM players
            JOIN user_profiles ON user_profiles.id = players.user_id
            WHERE players.team_id = lineups.team_id
            AND user_profiles.id = auth.uid()
        )
    );

    -- Only managers can create lineups for their team
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

    -- Only managers can update their team's lineups (with deadline restrictions)
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

    -- Only admins and team managers can delete lineups
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

EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Lineups table does not exist yet, skipping policy creation';
END
$$;

-- Create a function to automatically set submission deadline based on match kickoff time
CREATE OR REPLACE FUNCTION set_lineup_submission_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- If kickoff_time is provided, set submission deadline to 3 hours before
    IF NEW.kickoff_time IS NOT NULL THEN
        NEW.submission_deadline = NEW.kickoff_time - INTERVAL '3 hours';
    END IF;
    
    -- If being submitted (submitted_at is set), update verification status
    IF NEW.submitted_at IS NOT NULL AND OLD.submitted_at IS NULL THEN
        NEW.verification_status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if lineups table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lineups') THEN
        DROP TRIGGER IF EXISTS trigger_set_lineup_deadline ON lineups;
        CREATE TRIGGER trigger_set_lineup_deadline
            BEFORE INSERT OR UPDATE ON lineups
            FOR EACH ROW
            EXECUTE FUNCTION set_lineup_submission_deadline();
    END IF;
END
$$; 