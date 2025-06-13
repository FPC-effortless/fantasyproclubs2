-- Drop existing RLS policies
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