-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create players table if it doesn't exist
CREATE TABLE IF NOT EXISTS players (
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

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for teams table
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

-- Create policies for players table
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 