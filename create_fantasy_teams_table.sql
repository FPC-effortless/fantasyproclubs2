-- Quick fix: Create fantasy_teams table
-- Run this in Supabase SQL Editor to fix the immediate issue

-- Create fantasy_teams table
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budget DECIMAL(10,2) DEFAULT 100.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, competition_id)
);

-- Enable Row Level Security
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
    FOR SELECT USING (true);

CREATE POLICY "fantasy_teams_owner_full" ON public.fantasy_teams
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON public.fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_competition_id ON public.fantasy_teams(competition_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_fantasy_teams_updated_at') THEN
        CREATE TRIGGER set_fantasy_teams_updated_at
            BEFORE UPDATE ON public.fantasy_teams
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Success message
SELECT 'fantasy_teams table created successfully!' as message; 