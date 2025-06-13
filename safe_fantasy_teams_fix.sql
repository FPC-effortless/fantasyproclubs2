-- Safe Fantasy Teams Table Creation
-- This script checks table structure and creates tables safely

-- First, let's check what tables exist
SELECT 'Checking existing tables...' as step;

-- Check if competitions table exists and its structure
DO $$ 
DECLARE
    competitions_exists boolean := false;
    competitions_has_id boolean := false;
BEGIN
    -- Check if competitions table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'competitions' AND table_schema = 'public'
    ) INTO competitions_exists;
    
    IF competitions_exists THEN
        RAISE NOTICE 'competitions table exists';
        
        -- Check if it has an id column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'competitions' AND column_name = 'id' AND table_schema = 'public'
        ) INTO competitions_has_id;
        
        IF competitions_has_id THEN
            RAISE NOTICE 'competitions table has id column';
        ELSE
            RAISE NOTICE 'competitions table does NOT have id column';
        END IF;
    ELSE
        RAISE NOTICE 'competitions table does NOT exist';
    END IF;
END $$;

-- Create fantasy_teams table without competition_id first (we'll add it later if possible)
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    budget DECIMAL(10,2) DEFAULT 100.00,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add competition_id column only if competitions table exists with id column
DO $$ 
DECLARE
    can_add_competition_ref boolean := false;
BEGIN
    -- Check if we can safely add competition reference
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_name = 'competitions' 
        AND t.table_schema = 'public'
        AND c.column_name = 'id'
        AND c.table_schema = 'public'
    ) INTO can_add_competition_ref;
    
    IF can_add_competition_ref THEN
        -- Add competition_id column with foreign key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'fantasy_teams' AND column_name = 'competition_id'
        ) THEN
            ALTER TABLE public.fantasy_teams 
            ADD COLUMN competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added competition_id column with foreign key';
        END IF;
        
        -- Add unique constraint
        BEGIN
            ALTER TABLE public.fantasy_teams 
            ADD CONSTRAINT fantasy_teams_user_competition_unique 
            UNIQUE(user_id, competition_id);
        EXCEPTION 
            WHEN duplicate_object THEN
                RAISE NOTICE 'Unique constraint already exists';
        END;
    ELSE
        -- Add competition_id column without foreign key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'fantasy_teams' AND column_name = 'competition_id'
        ) THEN
            ALTER TABLE public.fantasy_teams 
            ADD COLUMN competition_id UUID;
            RAISE NOTICE 'Added competition_id column without foreign key (competitions table structure unknown)';
        END IF;
        
        -- Add unique constraint on user_id only
        BEGIN
            ALTER TABLE public.fantasy_teams 
            ADD CONSTRAINT fantasy_teams_user_unique 
            UNIQUE(user_id);
        EXCEPTION 
            WHEN duplicate_object THEN
                RAISE NOTICE 'User unique constraint already exists';
        END;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "fantasy_teams_public_read" ON public.fantasy_teams;
DROP POLICY IF EXISTS "fantasy_teams_owner_full" ON public.fantasy_teams;

-- Create RLS policies
CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
    FOR SELECT USING (true);

CREATE POLICY "fantasy_teams_owner_full" ON public.fantasy_teams
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
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

-- Insert some sample data for testing
INSERT INTO public.fantasy_teams (user_id, name, budget, points) 
SELECT 
    u.id,
    'Team ' || SUBSTRING(u.id::text, 1, 8),
    ROUND(90 + RANDOM() * 20, 2),
    FLOOR(RANDOM() * 500)
FROM auth.users u
LIMIT 5
ON CONFLICT DO NOTHING;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'fantasy_teams' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'fantasy_teams table created successfully!' as message,
       'Check the table structure above' as note; 