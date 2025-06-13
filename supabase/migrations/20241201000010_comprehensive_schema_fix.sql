-- =============================================================================
-- COMPREHENSIVE SCHEMA FIXES - EA FC Pro Clubs App
-- Date: 2024-12-01
-- =============================================================================

-- 1. CLEANUP EXISTING INCONSISTENT POLICIES
-- =============================================================================

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 2. STANDARDIZE USER_PROFILES TABLE
-- =============================================================================

-- Ensure consistent structure
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('admin', 'manager', 'player', 'fan')) NOT NULL DEFAULT 'fan';

-- Remove deprecated columns that cause confusion
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS is_admin;

-- 3. CREATE CONSISTENT RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- User profiles policies (avoid recursion)
CREATE POLICY "user_profiles_public_read"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "user_profiles_own_update"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_own_insert"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Teams policies
CREATE POLICY "teams_public_read"
ON teams FOR SELECT
USING (true);

CREATE POLICY "teams_admin_full_access"
ON teams FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

CREATE POLICY "teams_manager_own_team"
ON teams FOR ALL
TO authenticated
USING (manager_id = auth.uid())
WITH CHECK (manager_id = auth.uid());

-- Players policies
CREATE POLICY "players_public_read"
ON players FOR SELECT
USING (true);

CREATE POLICY "players_admin_full_access"
ON players FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

CREATE POLICY "players_manager_team_access"
ON players FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = players.team_id
        AND teams.manager_id = auth.uid()
    )
);

-- Competitions policies
CREATE POLICY "competitions_public_read"
ON competitions FOR SELECT
USING (true);

CREATE POLICY "competitions_admin_full_access"
ON competitions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- Lineups policies
CREATE POLICY "lineups_public_read"
ON lineups FOR SELECT
USING (true);

CREATE POLICY "lineups_admin_full_access"
ON lineups FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

CREATE POLICY "lineups_manager_team_access"
ON lineups FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM teams
        WHERE teams.id = lineups.team_id
        AND teams.manager_id = auth.uid()
    )
);

-- Lineup players policies
CREATE POLICY "lineup_players_public_read"
ON lineup_players FOR SELECT
USING (true);

CREATE POLICY "lineup_players_admin_full_access"
ON lineup_players FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- System settings policies
CREATE POLICY "system_settings_authenticated_read"
ON system_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "system_settings_admin_full_access"
ON system_settings FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- 4. ENSURE PROPER INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);
CREATE INDEX IF NOT EXISTS idx_lineups_team_id ON lineups(team_id);

-- 5. REFRESH SCHEMA CACHE
-- =============================================================================

SELECT pg_notify('pgrst', 'reload schema');

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Comprehensive schema fix completed - all policies now use consistent user_type admin pattern';
END $$; 