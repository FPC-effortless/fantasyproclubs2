-- Drop existing foreign key if it exists
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE players
ADD CONSTRAINT players_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE; 