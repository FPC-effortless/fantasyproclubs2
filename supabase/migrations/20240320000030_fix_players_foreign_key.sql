-- Drop existing foreign key if it exists
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_user_id_fkey;

-- Add the foreign key back with the correct name and columns
ALTER TABLE players
ADD CONSTRAINT players_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Create an index to improve join performance
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id); 