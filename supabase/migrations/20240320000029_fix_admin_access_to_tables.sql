-- Drop existing policies on teams and competitions
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('teams', 'competitions', 'matches', 'players')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Enable RLS on these tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create read policies for authenticated users
CREATE POLICY "Anyone can view teams"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view competitions"
ON competitions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view matches"
ON matches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view players"
ON players FOR SELECT
TO authenticated
USING (true);

-- Create admin policies for teams
CREATE POLICY "Admins can manage teams"
ON teams FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create admin policies for competitions
CREATE POLICY "Admins can manage competitions"
ON competitions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create admin policies for matches
CREATE POLICY "Admins can manage matches"
ON matches FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create admin policies for players
CREATE POLICY "Admins can manage players"
ON players FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create team manager policies
CREATE POLICY "Team managers can manage their teams"
ON teams FOR ALL
TO authenticated
USING (
    manager_id = auth.uid()
);

CREATE POLICY "Team managers can manage their players"
ON players FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM teams
        WHERE id = team_id
        AND manager_id = auth.uid()
    )
); 