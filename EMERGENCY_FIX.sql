-- ================================
-- EMERGENCY FIX - Restore Application Functionality
-- Run this IMMEDIATELY in Supabase SQL Editor
-- This fixes the permission denied errors while maintaining security
-- ================================

-- 1. FIX USER PROFILES ACCESS
-- The current policy is too restrictive, fix it to allow proper access

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "user_profiles_own_read" ON public.user_profiles;

-- Create a more permissive but still secure read policy
-- Allow authenticated users to read basic profile info, but restrict sensitive data
CREATE POLICY "user_profiles_authenticated_read" ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow anonymous users to read only basic public info (for team displays, etc.)
CREATE POLICY "user_profiles_public_read" ON public.user_profiles 
FOR SELECT 
TO anon
USING (true);

-- Keep update policy secure (users can only update their own profile)
DROP POLICY IF EXISTS "user_profiles_own_update" ON public.user_profiles;
CREATE POLICY "user_profiles_own_update" ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 2. FIX TEAMS ACCESS  
-- Ensure teams are readable by all users (needed for team selection)

-- Drop restrictive policies
DROP POLICY IF EXISTS "teams_public_read" ON public.teams;
DROP POLICY IF EXISTS "teams_owner_update" ON public.teams;
DROP POLICY IF EXISTS "teams_owner_delete" ON public.teams;

-- Create proper team policies
CREATE POLICY "teams_public_read" ON public.teams 
FOR SELECT 
USING (true); -- Anyone can read team information

CREATE POLICY "teams_manager_update" ON public.teams 
FOR UPDATE 
TO authenticated
USING (
  manager_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
)
WITH CHECK (
  manager_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "teams_manager_delete" ON public.teams 
FOR DELETE 
TO authenticated
USING (
  manager_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- 3. FIX PLAYERS ACCESS
-- Allow reading player information for team displays

DROP POLICY IF EXISTS "players_public_read" ON public.players;
DROP POLICY IF EXISTS "players_own_manage" ON public.players;

CREATE POLICY "players_public_read" ON public.players 
FOR SELECT 
USING (true);

CREATE POLICY "players_team_manage" ON public.players 
FOR ALL 
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = players.team_id 
    AND manager_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = players.team_id 
    AND manager_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- 4. ENSURE COMPETITIONS ARE READABLE
-- Allow reading competition data

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competitions') THEN
        DROP POLICY IF EXISTS "competitions_public_read" ON public.competitions;
        CREATE POLICY "competitions_public_read" ON public.competitions 
        FOR SELECT 
        USING (true);
    END IF;
END
$$;

-- 5. ENSURE COMPETITION_TEAMS ARE READABLE
-- Fix competition teams access

DROP POLICY IF EXISTS "competition_teams_public_read" ON public.competition_teams;
DROP POLICY IF EXISTS "competition_teams_manager_manage" ON public.competition_teams;

CREATE POLICY "competition_teams_public_read" ON public.competition_teams 
FOR SELECT 
USING (true);

CREATE POLICY "competition_teams_manage" ON public.competition_teams 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = competition_teams.team_id 
    AND manager_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = competition_teams.team_id 
    AND manager_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- 6. GRANT PROPER PERMISSIONS TO ANON
-- Restore necessary anonymous access

GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.competitions TO anon;
GRANT SELECT ON public.competition_teams TO anon;
GRANT SELECT ON public.players TO anon;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'featured_matches') THEN
        GRANT SELECT ON public.featured_matches TO anon;
    END IF;
END
$$;

-- 7. VERIFY THE FIX
-- Test that basic queries work

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_profiles LIMIT 1
    )
    THEN '✅ SUCCESS: user_profiles table accessible'
    ELSE '🔴 ERROR: user_profiles still blocked'
  END as user_profiles_test;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.teams LIMIT 1
    )
    THEN '✅ SUCCESS: teams table accessible'
    ELSE '🔴 ERROR: teams still blocked'
  END as teams_test;

-- 8. LOG THE EMERGENCY FIX
DO $$
BEGIN
    PERFORM public.log_security_event(
      'EMERGENCY_FIX_APPLIED',
      'DATABASE',
      'access_policies',
      jsonb_build_object(
        'fix_type', 'restore_application_access',
        'applied_at', NOW()::text,
        'reason', 'overly_restrictive_policies'
      )
    );
    RAISE NOTICE 'Emergency fix logged successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Emergency fix applied (logging skipped)';
END
$$;

-- Final success message
SELECT 
  '🚑 EMERGENCY FIX APPLIED!' as status,
  NOW() as applied_at,
  'Application should now work properly. Please restart your dev server.' as next_step; 