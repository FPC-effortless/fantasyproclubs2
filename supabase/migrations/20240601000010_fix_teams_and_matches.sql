-- Add short_name to teams table
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS short_name TEXT NOT NULL DEFAULT 'TBD';

-- Add is_featured to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS matches_home_team_id_fkey,
DROP CONSTRAINT IF EXISTS matches_away_team_id_fkey;

-- Add foreign key constraints with proper names
ALTER TABLE public.matches
ADD CONSTRAINT matches_home_team_id_fkey 
    FOREIGN KEY (home_team_id) 
    REFERENCES public.teams(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT matches_away_team_id_fkey 
    FOREIGN KEY (away_team_id) 
    REFERENCES public.teams(id) 
    ON DELETE SET NULL;

-- Enable RLS on teams and matches tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to read teams and matches
CREATE POLICY "Allow authenticated users to read teams"
    ON public.teams
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to read matches"
    ON public.matches
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.teams TO authenticated;
GRANT SELECT ON public.matches TO authenticated; 