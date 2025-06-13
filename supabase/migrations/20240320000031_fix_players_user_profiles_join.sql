-- First, let's check and fix the user_profiles table
DO $$ 
BEGIN
  -- Make sure user_profiles has the correct columns
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN id uuid PRIMARY KEY DEFAULT auth.uid();
  END IF;
END $$;

-- Now fix the players table foreign key
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_user_id_fkey;

-- Add the foreign key with explicit columns
ALTER TABLE players
ADD CONSTRAINT players_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Create an index for the join
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);

-- Grant necessary permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON players TO authenticated; 