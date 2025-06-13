-- Allow public access to players for competition viewing
-- Date: 2024-12-01
-- Purpose: Enable public viewing of competition screens without authentication

-- Drop existing read policies for players table
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON players;
DROP POLICY IF EXISTS "Anyone can view players" ON players;
DROP POLICY IF EXISTS "Players are viewable by everyone" ON players;
DROP POLICY IF EXISTS "players_public_read" ON players;

-- Create new public read policy for players
CREATE POLICY "players_public_read_access"
ON players FOR SELECT
USING (true);

-- Also ensure competitions and teams have public read access
DROP POLICY IF EXISTS "competitions_public_read" ON competitions;
DROP POLICY IF EXISTS "Anyone can view competitions" ON competitions;

CREATE POLICY "competitions_public_read_access"
ON competitions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "teams_public_read" ON teams;
DROP POLICY IF EXISTS "Anyone can view teams" ON teams;
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;

CREATE POLICY "teams_public_read_access"
ON teams FOR SELECT
USING (true);

-- Ensure competition_teams junction table is also publicly readable
ALTER TABLE competition_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competition_teams_public_read" ON competition_teams;

CREATE POLICY "competition_teams_public_read_access"
ON competition_teams FOR SELECT
USING (true);

-- Ensure matches are publicly readable for competition viewing
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_public_read" ON matches;
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;

CREATE POLICY "matches_public_read_access"
ON matches FOR SELECT
USING (true);

-- Ensure user_profiles are publicly readable (they already are, but let's be explicit)
DROP POLICY IF EXISTS "user_profiles_public_read" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;

CREATE POLICY "user_profiles_public_read_access"
ON user_profiles FOR SELECT
USING (true); 