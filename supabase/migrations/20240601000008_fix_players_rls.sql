-- Drop ALL existing policies from players table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'players'
        AND schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON players', r.policyname);
    END LOOP;
END $$;

-- Drop existing foreign key if it exists
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE players
ADD CONSTRAINT players_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policy for selecting players (anyone can view)
CREATE POLICY "Enable read access for all authenticated users"
ON players FOR SELECT
TO authenticated
USING (true);

-- Policy for inserting players (team managers and admins)
CREATE POLICY "Enable insert for team managers and admins"
ON players FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles
      WHERE id = auth.uid()
    )
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Policy for updating players (team managers and admins)
CREATE POLICY "Enable update for team managers and admins"
ON players FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles
      WHERE id = auth.uid()
    )
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
);

-- Policy for deleting players (team managers and admins)
CREATE POLICY "Enable delete for team managers and admins"
ON players FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND manager_id = (
      SELECT id FROM user_profiles
      WHERE id = auth.uid()
    )
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND user_type = 'admin'
  )
); 