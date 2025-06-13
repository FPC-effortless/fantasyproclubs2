-- Drop existing policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams can be updated by their manager" ON teams;
DROP POLICY IF EXISTS "Teams can be deleted by their manager" ON teams;
DROP POLICY IF EXISTS "Players can be updated by their team manager" ON players;
DROP POLICY IF EXISTS "Players can be deleted by their team manager" ON players;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;

-- Drop existing tables with dependencies in correct order
DROP TABLE IF EXISTS fantasy_transfers;
DROP TABLE IF EXISTS fantasy_selections;
DROP TABLE IF EXISTS fantasy_players CASCADE;
DROP TABLE IF EXISTS player_match_stats;
DROP TABLE IF EXISTS match_team_stats;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS competition_teams;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS team_invites;
DROP TABLE IF EXISTS teams CASCADE;

-- Recreate teams table
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate team_members table
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'player',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, user_id)
);

-- Recreate competition_teams table
CREATE TABLE competition_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(competition_id, team_id)
);

-- Recreate matches table
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'scheduled',
    match_date TIMESTAMP WITH TIME ZONE,
    home_score INTEGER,
    away_score INTEGER,
    stream_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate match_team_stats table
CREATE TABLE match_team_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    possession INTEGER,
    shots INTEGER,
    shots_on_target INTEGER,
    corners INTEGER,
    fouls INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, team_id)
);

-- Recreate players table
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    position TEXT NOT NULL,
    number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, team_id)
);

-- Recreate player_match_stats table
CREATE TABLE player_match_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    rating DECIMAL(3,1),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, player_id)
);

-- Recreate fantasy_players table
CREATE TABLE fantasy_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate fantasy_selections table
CREATE TABLE fantasy_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fantasy_player_id UUID REFERENCES fantasy_players(id) ON DELETE CASCADE NOT NULL,
    gameweek INTEGER NOT NULL,
    is_captain BOOLEAN DEFAULT false,
    is_vice_captain BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, fantasy_player_id, gameweek)
);

-- Recreate fantasy_transfers table
CREATE TABLE fantasy_transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    player_out_id UUID REFERENCES fantasy_players(id) ON DELETE CASCADE NOT NULL,
    player_in_id UUID REFERENCES fantasy_players(id) ON DELETE CASCADE NOT NULL,
    gameweek INTEGER NOT NULL,
    transfer_cost INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate team_invites table
CREATE TABLE team_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
-- Teams policies
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

CREATE POLICY "Teams can be created by authenticated users"
    ON teams FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Teams can be updated by their manager"
    ON teams FOR UPDATE
    TO authenticated
    USING (auth.uid() = manager_id)
    WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Teams can be deleted by their manager"
    ON teams FOR DELETE
    TO authenticated
    USING (auth.uid() = manager_id);

-- Players policies
CREATE POLICY "Players are viewable by everyone"
    ON players FOR SELECT
    USING (true);

CREATE POLICY "Players can be created by authenticated users"
    ON players FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can be updated by their team manager"
    ON players FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = players.team_id
            AND teams.manager_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = players.team_id
            AND teams.manager_id = auth.uid()
        )
    );

CREATE POLICY "Players can be deleted by their team manager"
    ON players FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = players.team_id
            AND teams.manager_id = auth.uid()
        )
    );

-- Team invites policies
CREATE POLICY "Team invites are viewable by involved parties"
    ON team_invites FOR SELECT
    USING (
        auth.uid() = player_id OR
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_invites.team_id
            AND teams.manager_id = auth.uid()
        )
    );

CREATE POLICY "Team invites can be created by team managers"
    ON team_invites FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_id
            AND teams.manager_id = auth.uid()
        )
    );

CREATE POLICY "Team invites can be updated by involved parties"
    ON team_invites FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = player_id OR
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_invites.team_id
            AND teams.manager_id = auth.uid()
        )
    );

-- Team members policies
CREATE POLICY "Team members are viewable by everyone"
    ON team_members FOR SELECT
    USING (true);

CREATE POLICY "Team members can be managed by team managers"
    ON team_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM teams
            WHERE teams.id = team_members.team_id
            AND teams.manager_id = auth.uid()
        )
    );

-- Match-related policies
CREATE POLICY "Match data is viewable by everyone"
    ON matches FOR SELECT
    USING (true);

CREATE POLICY "Match stats are viewable by everyone"
    ON match_team_stats FOR SELECT
    USING (true);

CREATE POLICY "Player match stats are viewable by everyone"
    ON player_match_stats FOR SELECT
    USING (true);

-- Fantasy-related policies
CREATE POLICY "Fantasy players are viewable by everyone"
    ON fantasy_players FOR SELECT
    USING (true);

CREATE POLICY "Fantasy selections are viewable by owner"
    ON fantasy_selections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Fantasy selections can be managed by owner"
    ON fantasy_selections FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Fantasy transfers are viewable by owner"
    ON fantasy_transfers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Fantasy transfers can be managed by owner"
    ON fantasy_transfers FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Create triggers for all tables
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competition_teams_updated_at
    BEFORE UPDATE ON competition_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_team_stats_updated_at
    BEFORE UPDATE ON match_team_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_match_stats_updated_at
    BEFORE UPDATE ON player_match_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fantasy_players_updated_at
    BEFORE UPDATE ON fantasy_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fantasy_selections_updated_at
    BEFORE UPDATE ON fantasy_selections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fantasy_transfers_updated_at
    BEFORE UPDATE ON fantasy_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invites_updated_at
    BEFORE UPDATE ON team_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 