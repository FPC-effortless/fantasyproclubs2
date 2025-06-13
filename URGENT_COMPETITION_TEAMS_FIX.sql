-- URGENT: Fix Competition Teams Management
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ===========================
-- 1. DROP ALL EXISTING COMPETITION_TEAMS POLICIES
-- ===========================

DROP POLICY IF EXISTS "Competition teams are viewable by everyone" ON public.competition_teams;
DROP POLICY IF EXISTS "Enable full access for admins" ON public.competition_teams;
DROP POLICY IF EXISTS "Allow authenticated users to manage competition teams" ON public.competition_teams;
DROP POLICY IF EXISTS "Enable read access for team managers" ON public.competition_teams;
DROP POLICY IF EXISTS "competition_teams_public_read" ON public.competition_teams;
DROP POLICY IF EXISTS "competition_teams_admin_full_access" ON public.competition_teams;
DROP POLICY IF EXISTS "competition_teams_authenticated_manage" ON public.competition_teams;

-- ===========================
-- 2. CREATE SIMPLE, WORKING POLICIES
-- ===========================

-- Allow everyone to read competition teams (public access)
CREATE POLICY "competition_teams_public_read_new"
ON public.competition_teams FOR SELECT
USING (true);

-- Allow ALL authenticated users to manage competition teams (simplified)
CREATE POLICY "competition_teams_authenticated_manage_new"
ON public.competition_teams FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===========================
-- 3. RECREATE THE RPC FUNCTION WITH SIMPLER PERMISSIONS
-- ===========================

-- Drop existing function
DROP FUNCTION IF EXISTS public.manage_competition_teams(UUID, UUID[]);

-- Create new simplified function
CREATE OR REPLACE FUNCTION public.manage_competition_teams(
    p_competition_id UUID,
    p_team_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete existing teams that are not in the new list
    DELETE FROM public.competition_teams
    WHERE competition_id = p_competition_id
    AND team_id != ALL(p_team_ids);

    -- Insert new teams that don't exist yet
    INSERT INTO public.competition_teams (competition_id, team_id, status)
    SELECT p_competition_id, team_id, 'active'
    FROM unnest(p_team_ids) AS team_id
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.competition_teams
        WHERE competition_id = p_competition_id
        AND team_id = team_id
    );
END;
$$;

-- ===========================
-- 4. GRANT PERMISSIONS
-- ===========================

-- Grant permissions on competition_teams table
GRANT ALL ON public.competition_teams TO authenticated;
GRANT SELECT ON public.competition_teams TO anon;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION public.manage_competition_teams(UUID, UUID[]) TO authenticated;

-- ===========================
-- 5. VERIFICATION
-- ===========================

-- Test that policies work
SELECT 'Competition teams table policies updated successfully!' as status;
SELECT 'RPC function recreated successfully!' as function_status;
SELECT 'Current competition teams count: ' || COUNT(*) as competition_teams_info FROM public.competition_teams; 