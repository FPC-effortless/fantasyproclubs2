-- Enable RLS on players table
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy for inserting players
CREATE POLICY "Users can insert players if they are team managers"
ON players
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_id
    AND teams.manager_id = auth.uid()
  )
);

-- Policy for viewing players
CREATE POLICY "Anyone can view players"
ON players
FOR SELECT
TO authenticated
USING (true);

-- Policy for updating players
CREATE POLICY "Team managers can update their team's players"
ON players
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_id
    AND teams.manager_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_id
    AND teams.manager_id = auth.uid()
  )
);

-- Policy for deleting players
CREATE POLICY "Team managers can delete their team's players"
ON players
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_id
    AND teams.manager_id = auth.uid()
  )
); 