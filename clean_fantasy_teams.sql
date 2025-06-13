-- Clean Fantasy Teams Table Creation
-- This drops existing table and recreates it with correct structure

-- Drop existing table if it exists (this will clean up any incorrect structure)
DROP TABLE IF EXISTS public.fantasy_teams CASCADE;

-- Create fantasy_teams table with correct structure
CREATE TABLE public.fantasy_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    competition_id UUID,
    name TEXT NOT NULL,
    budget DECIMAL(10,2) DEFAULT 100.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
    FOR SELECT USING (true);

CREATE POLICY "fantasy_teams_owner_write" ON public.fantasy_teams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "fantasy_teams_owner_update" ON public.fantasy_teams
    FOR UPDATE USING (true);

CREATE POLICY "fantasy_teams_owner_delete" ON public.fantasy_teams
    FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX idx_fantasy_teams_competition_id ON public.fantasy_teams(competition_id);

-- Add updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger
CREATE TRIGGER set_fantasy_teams_updated_at
    BEFORE UPDATE ON public.fantasy_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'fantasy_teams' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'fantasy_teams table created successfully (empty - ready for users to create teams)!' as message; 