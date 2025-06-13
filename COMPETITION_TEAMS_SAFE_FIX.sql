-- SAFE Competition Teams Fix - Checks existing policies first
-- Run this in your Supabase SQL Editor

-- ===========================
-- 1. CHECK AND CONDITIONALLY CREATE POLICIES
-- ===========================

-- Check if the public read policy exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'competition_teams' 
        AND policyname = 'competition_teams_public_read_new'
    ) THEN
        CREATE POLICY "competition_teams_public_read_new"
        ON public.competition_teams FOR SELECT
        USING (true);
        
        RAISE NOTICE 'Created policy: competition_teams_public_read_new';
    ELSE
        RAISE NOTICE 'Policy competition_teams_public_read_new already exists';
    END IF;
END $$;

-- Check if the authenticated manage policy exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'competition_teams' 
        AND policyname = 'competition_teams_authenticated_manage_new'
    ) THEN
        CREATE POLICY "competition_teams_authenticated_manage_new"
        ON public.competition_teams FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
        
        RAISE NOTICE 'Created policy: competition_teams_authenticated_manage_new';
    ELSE
        RAISE NOTICE 'Policy competition_teams_authenticated_manage_new already exists';
    END IF;
END $$;

-- ===========================
-- 2. CHECK AND RECREATE FUNCTION
-- ===========================

-- Always recreate the function to ensure it's working correctly
CREATE OR REPLACE FUNCTION public.manage_competition_teams(
    p_competition_id UUID,
    p_team_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team_id UUID;
    v_existing_teams UUID[];
    v_teams_to_delete UUID[];
    v_teams_to_add UUID[];
BEGIN
    -- Log the operation
    RAISE NOTICE 'Managing teams for competition: %, team_ids: %', p_competition_id, p_team_ids;
    
    -- Get existing teams for this competition
    SELECT ARRAY(
        SELECT team_id 
        FROM public.competition_teams 
        WHERE competition_id = p_competition_id
    ) INTO v_existing_teams;
    
    -- Find teams to delete (existing but not in new list)
    SELECT ARRAY(
        SELECT unnest(v_existing_teams) 
        EXCEPT 
        SELECT unnest(p_team_ids)
    ) INTO v_teams_to_delete;
    
    -- Find teams to add (in new list but not existing)
    SELECT ARRAY(
        SELECT unnest(p_team_ids) 
        EXCEPT 
        SELECT unnest(v_existing_teams)
    ) INTO v_teams_to_add;
    
    RAISE NOTICE 'Teams to delete: %, Teams to add: %', v_teams_to_delete, v_teams_to_add;
    
    -- Delete teams no longer in the list
    IF array_length(v_teams_to_delete, 1) > 0 THEN
        DELETE FROM public.competition_teams
        WHERE competition_id = p_competition_id
        AND team_id = ANY(v_teams_to_delete);
        
        RAISE NOTICE 'Deleted % teams', array_length(v_teams_to_delete, 1);
    END IF;
    
    -- Insert new teams
    IF array_length(v_teams_to_add, 1) > 0 THEN
        FOREACH v_team_id IN ARRAY v_teams_to_add
        LOOP
            INSERT INTO public.competition_teams (competition_id, team_id, status)
            VALUES (p_competition_id, v_team_id, 'active')
            ON CONFLICT (competition_id, team_id) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Added % teams', array_length(v_teams_to_add, 1);
    END IF;
    
    RAISE NOTICE 'Competition teams management completed successfully';
END;
$$;

-- ===========================
-- 3. ENSURE PROPER PERMISSIONS
-- ===========================

-- Grant permissions on the table
GRANT SELECT ON public.competition_teams TO anon;
GRANT ALL ON public.competition_teams TO authenticated;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.manage_competition_teams(UUID, UUID[]) TO authenticated;

-- ===========================
-- 4. VERIFICATION QUERIES
-- ===========================

-- Show current policies
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
AND tablename = 'competition_teams'
ORDER BY policyname;

-- Show current competition teams count
SELECT 
    'Current competition teams count: ' || COUNT(*) as info
FROM public.competition_teams;

-- Test the function exists and is accessible
SELECT 
    'Function exists and is accessible' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'manage_competition_teams';

SELECT 'Competition teams management fix completed successfully!' as final_status; 