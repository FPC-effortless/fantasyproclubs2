-- =============================================================================
-- FANTASY AUTHENTICATION FIX - EA FC Pro Clubs App
-- Run this in your Supabase SQL Editor to diagnose and fix fantasy issues
-- =============================================================================

-- Step 1: Check current schema and tables
SELECT 'Schema Check - Current Tables' as step;

SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%fantasy%'
ORDER BY tablename;

-- Step 2: Check if fantasy_teams table exists and its structure
SELECT 'Fantasy Teams Table Check' as step;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'fantasy_teams' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check if competitions table has fantasy_enabled column
SELECT 'Competitions Fantasy Column Check' as step;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'competitions' 
AND table_schema = 'public'
AND column_name = 'fantasy_enabled';

-- Step 4: Check current user_profiles structure
SELECT 'User Profiles Table Check' as step;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Check RLS policies on fantasy-related tables
SELECT 'RLS Policies Check' as step;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND (tablename LIKE '%fantasy%' OR tablename = 'competitions')
ORDER BY tablename, policyname;

-- Step 6: Create fantasy_teams table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'fantasy_teams' AND schemaname = 'public') THEN
        CREATE TABLE public.fantasy_teams (
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
        
        -- Enable RLS
        ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "fantasy_teams_public_read" ON public.fantasy_teams
            FOR SELECT USING (true);
            
        CREATE POLICY "fantasy_teams_owner_full" ON public.fantasy_teams
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
            
        RAISE NOTICE 'Created fantasy_teams table with RLS policies';
    ELSE
        RAISE NOTICE 'fantasy_teams table already exists';
    END IF;
END $$;

-- Step 7: Ensure competitions table has fantasy_enabled column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'competitions' AND column_name = 'fantasy_enabled'
    ) THEN
        ALTER TABLE public.competitions ADD COLUMN fantasy_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added fantasy_enabled column to competitions';
    ELSE
        RAISE NOTICE 'fantasy_enabled column already exists in competitions';
    END IF;
END $$;

-- Step 8: Check and fix RLS policies on competitions
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'competitions' AND rowsecurity = true
    ) THEN
        ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on competitions table';
    END IF;
    
    -- Create basic read policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'competitions' AND policyname = 'competitions_public_read'
    ) THEN
        CREATE POLICY "competitions_public_read" ON public.competitions
            FOR SELECT USING (true);
        RAISE NOTICE 'Created public read policy for competitions';
    END IF;
END $$;

-- Step 9: Create fantasy_player_stats table if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'fantasy_player_stats' AND schemaname = 'public') THEN
        CREATE TABLE public.fantasy_player_stats (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
            competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
            fantasy_points DECIMAL(10, 2) DEFAULT 0.0,
            fantasy_price DECIMAL(10, 2) DEFAULT 5.0,
            games_played INTEGER DEFAULT 0,
            goals INTEGER DEFAULT 0,
            assists INTEGER DEFAULT 0,
            clean_sheets INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(player_id, competition_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.fantasy_player_stats ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "fantasy_player_stats_public_read" ON public.fantasy_player_stats
            FOR SELECT USING (true);
            
        RAISE NOTICE 'Created fantasy_player_stats table with RLS policies';
    ELSE
        RAISE NOTICE 'fantasy_player_stats table already exists';
    END IF;
END $$;

-- Step 10: Update competitions to enable fantasy
UPDATE public.competitions 
SET fantasy_enabled = true 
WHERE fantasy_enabled = false 
AND id IN (
    SELECT id FROM public.competitions 
    WHERE type = 'league' 
    ORDER BY created_at DESC 
    LIMIT 3
);

-- Step 11: Check if we have any sample data
SELECT 'Sample Data Check' as step;

SELECT 
    'competitions' as table_name,
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE fantasy_enabled = true) as fantasy_enabled_count
FROM public.competitions
UNION ALL
SELECT 
    'fantasy_teams' as table_name,
    COUNT(*) as record_count,
    NULL as fantasy_enabled_count
FROM public.fantasy_teams
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count,
    NULL as fantasy_enabled_count
FROM public.user_profiles;

-- Step 12: Final status check
SELECT 'Fantasy System Status' as step;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'fantasy_teams') THEN 'OK'
        ELSE 'MISSING'
    END as fantasy_teams_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'competitions' AND column_name = 'fantasy_enabled') THEN 'OK'
        ELSE 'MISSING'
    END as fantasy_enabled_column,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.competitions WHERE fantasy_enabled = true) THEN 'OK'
        ELSE 'NO FANTASY COMPETITIONS'
    END as fantasy_competitions,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fantasy_teams') THEN 'OK'
        ELSE 'MISSING'
    END as fantasy_rls_policies;

-- Success message
SELECT 'Fantasy authentication system has been checked and fixed!' as result; 