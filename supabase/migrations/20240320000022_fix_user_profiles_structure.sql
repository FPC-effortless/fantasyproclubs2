-- Drop ALL policies from ALL tables that might reference user_profiles
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

-- Drop any existing foreign key constraints that reference user_profiles
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_user_id_fkey;
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_manager_id_fkey;
ALTER TABLE fantasy_teams DROP CONSTRAINT IF EXISTS fantasy_teams_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE account_upgrade_requests DROP CONSTRAINT IF EXISTS account_upgrade_requests_user_id_fkey;
ALTER TABLE account_upgrade_requests DROP CONSTRAINT IF EXISTS account_upgrade_requests_reviewed_by_fkey;

-- Update user_profiles table structure
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS psn_id,
ADD COLUMN IF NOT EXISTS gaming JSONB DEFAULT '{
    "xbox_gamertag": null,
    "psn_id": null,
    "preferred_platform": "both",
    "experience_level": "beginner",
    "platform_verified": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{
    "matches_played": 0,
    "win_rate": 0,
    "goals_per_game": 0
}'::jsonb,
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
    "email": true,
    "push": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS display JSONB DEFAULT '{
    "theme": "system",
    "language": "en"
}'::jsonb,
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Recreate foreign key constraints
ALTER TABLE players
ALTER COLUMN user_id TYPE UUID USING (uuid_generate_v4()),
ADD CONSTRAINT players_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);

ALTER TABLE teams
ADD CONSTRAINT teams_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES user_profiles(id);

ALTER TABLE fantasy_teams
ADD CONSTRAINT fantasy_teams_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);

ALTER TABLE notifications
ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);

ALTER TABLE account_upgrade_requests
ADD CONSTRAINT account_upgrade_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id),
ADD CONSTRAINT account_upgrade_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES user_profiles(id);

-- Enable RLS on all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;

-- Create base policies for user_profiles
CREATE POLICY "User profiles are viewable by everyone"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Create admin policies for all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('
            CREATE POLICY "Admins can do everything" ON %I
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE id = auth.uid()
                    AND role = ''admin''
                )
            )
        ', r.tablename);
    END LOOP;
END $$;

-- Create specific policies for players
CREATE POLICY "Enable read access for all authenticated users"
ON players FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for team managers"
ON players FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Enable update for team managers"
ON players FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Enable delete for team managers"
ON players FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- Create policies for competition teams
CREATE POLICY "Allow authenticated users to manage competition teams"
ON competition_teams FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- Create policies for teams
CREATE POLICY "Allow authenticated users to manage teams"
ON teams FOR ALL
TO authenticated
USING (
  manager_id = (
    SELECT id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Create policies for matches
CREATE POLICY "Allow authenticated users to manage matches"
ON matches FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE (id = home_team_id OR id = away_team_id)
    AND manager_id = (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- Create policies for notifications
CREATE POLICY "Allow authenticated users to manage notifications"
ON notifications FOR ALL
TO authenticated
USING (
  user_id = (
    SELECT id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Create policies for transfers
CREATE POLICY "Allow authenticated users to manage transfers"
ON transfers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE (id = from_team_id OR id = to_team_id)
    AND manager_id = (
      SELECT id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

-- Create policies for awards
CREATE POLICY "Allow authenticated users to manage awards"
ON awards FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE id = player_id
    AND team_id IN (
      SELECT id FROM teams
      WHERE manager_id = (
        SELECT id FROM user_profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Create policies for fantasy teams
CREATE POLICY "Allow authenticated users to manage fantasy teams"
ON fantasy_teams FOR ALL
TO authenticated
USING (
  user_id = (
    SELECT id FROM user_profiles WHERE id = auth.uid()
  )
); 