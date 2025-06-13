-- Add foreign key constraint between players and user_profiles
ALTER TABLE players
ADD CONSTRAINT fk_user_profile
FOREIGN KEY (user_id) 
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can insert players if they are team managers" ON players;
DROP POLICY IF EXISTS "Anyone can view players" ON players;
DROP POLICY IF EXISTS "Team managers can update their team's players" ON players;
DROP POLICY IF EXISTS "Team managers can delete their team's players" ON players;

-- Enable RLS on players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy for inserting players
CREATE POLICY "Enable insert for team managers"
ON players
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = players.team_id
    AND teams.manager_id = auth.uid()
  )
);

-- Policy for selecting players
CREATE POLICY "Enable read access for all authenticated users"
ON players
FOR SELECT
TO authenticated
USING (true);

-- Policy for updating players
CREATE POLICY "Enable update for team managers"
ON players
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = players.team_id
    AND teams.manager_id = auth.uid()
  )
);

-- Policy for deleting players
CREATE POLICY "Enable delete for team managers"
ON players
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = players.team_id
    AND teams.manager_id = auth.uid()
  )
); 