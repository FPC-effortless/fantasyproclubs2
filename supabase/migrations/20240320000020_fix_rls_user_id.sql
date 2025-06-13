-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable update for users based on psn_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on psn_id" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Enable read access for all authenticated users"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for users based on user_id"
ON user_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable insert for users based on user_id"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Drop existing RLS policies for players
DROP POLICY IF EXISTS "Enable insert for team managers" ON players;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON players;
DROP POLICY IF EXISTS "Enable update for team managers" ON players;
DROP POLICY IF EXISTS "Enable delete for team managers" ON players;

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy for selecting players (anyone can view)
CREATE POLICY "Enable read access for all authenticated users"
ON players FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting players (team managers only)
CREATE POLICY "Enable insert for team managers"
ON players FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Policy for updating players (team managers only)
CREATE POLICY "Enable update for team managers"
ON players FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
);

-- Policy for deleting players (team managers only)
CREATE POLICY "Enable delete for team managers"
ON players FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
); 