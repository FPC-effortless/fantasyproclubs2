-- Minimal Fantasy Teams Table Creation
-- This creates the table without foreign key dependencies to avoid column errors

-- Create fantasy_teams table with minimal structure
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "fantasy_teams_public_read" ON public.fantasy_teams;
DROP POLICY IF EXISTS "fantasy_teams_owner_full" ON public.fantasy_teams;

-- Create simple RLS policies
CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
    FOR SELECT USING (true);

CREATE POLICY "fantasy_teams_owner_write" ON public.fantasy_teams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "fantasy_teams_owner_update" ON public.fantasy_teams
    FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);

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

-- Insert sample data
INSERT INTO public.fantasy_teams (user_id, name, budget, points) VALUES
('00000000-0000-0000-0000-000000000001', 'Sample Team 1', 95.50, 150),
('00000000-0000-0000-0000-000000000002', 'Sample Team 2', 102.25, 275),
('00000000-0000-0000-0000-000000000003', 'Sample Team 3', 88.75, 320)
ON CONFLICT DO NOTHING;

SELECT 'fantasy_teams table created with sample data!' as message; 