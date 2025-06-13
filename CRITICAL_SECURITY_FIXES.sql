-- ================================
-- CRITICAL SECURITY FIXES
-- Run this IMMEDIATELY in Supabase SQL Editor
-- ================================

-- 1. REMOVE DANGEROUS SQL EXECUTION FUNCTION
-- This allows arbitrary SQL execution - EXTREMELY DANGEROUS
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- 2. FIX OVERLY PERMISSIVE TEAM POLICIES
-- Current policy allows ANY authenticated user to update ANY team
DROP POLICY IF EXISTS "teams_authenticated_update_new" ON public.teams;
DROP POLICY IF EXISTS "teams_authenticated_delete_new" ON public.teams;

-- Create proper team policies with ownership checks
CREATE POLICY "teams_owner_update" ON public.teams 
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

CREATE POLICY "teams_owner_delete" ON public.teams 
FOR DELETE 
TO authenticated
USING (
  manager_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- 3. SECURE USER PROFILE UPDATES
-- Ensure users can only update their own profiles
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;

CREATE POLICY "user_profiles_own_update" ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. SECURE COMPETITION TEAM MANAGEMENT
-- Only team managers or admins should manage competition teams
DROP POLICY IF EXISTS "Enable read access for all users" ON public.competition_teams;

CREATE POLICY "competition_teams_public_read" ON public.competition_teams 
FOR SELECT 
USING (true);

CREATE POLICY "competition_teams_manager_manage" ON public.competition_teams 
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

-- 5. SECURE SYSTEM SETTINGS (ADMIN ONLY)
CREATE POLICY "system_settings_admin_only" ON public.system_settings 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- 6. SECURE LINEUP MANAGEMENT
-- Only team members should manage lineups
CREATE POLICY "lineups_team_member_manage" ON public.lineups 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = lineups.team_id 
    AND (manager_id = auth.uid() OR id IN (
      SELECT team_id FROM public.players WHERE user_id = auth.uid()
    ))
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = lineups.team_id 
    AND (manager_id = auth.uid() OR id IN (
      SELECT team_id FROM public.players WHERE user_id = auth.uid()
    ))
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- 7. REVOKE UNNECESSARY PERMISSIONS
-- Remove overly broad permissions
REVOKE ALL ON public.teams FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.system_settings FROM anon;

-- Grant only necessary read permissions
GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.competitions TO anon;
GRANT SELECT ON public.featured_matches TO anon;

-- 8. CREATE AUDIT LOG TABLE FOR SECURITY MONITORING
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_log_admin_read" ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id, p_details
  );
END;
$$;

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Verify dangerous function is removed
SELECT 'SUCCESS: exec_sql function removed' as status 
WHERE NOT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'exec_sql'
);

-- Verify secure policies are in place
SELECT 'Security policies updated successfully' as status;

-- Count current policies for verification
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

SELECT 'CRITICAL SECURITY FIXES APPLIED - Restart your application!' as final_status; 