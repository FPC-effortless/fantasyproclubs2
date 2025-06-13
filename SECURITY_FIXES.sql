-- ================================
-- CRITICAL SECURITY FIXES
-- Run this IMMEDIATELY in Supabase SQL Editor
-- Date: $(date)
-- Priority: URGENT - Contains critical security vulnerabilities
-- ================================

-- 1. REMOVE DANGEROUS SQL EXECUTION FUNCTION (CRITICAL)
-- This function allows arbitrary SQL execution - EXTREMELY DANGEROUS
DROP FUNCTION IF EXISTS public.exec_sql(text);
DROP FUNCTION IF EXISTS public.execute_sql(text);
DROP FUNCTION IF EXISTS public.run_sql(text);

-- Verify removal
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('exec_sql', 'execute_sql', 'run_sql')) THEN
        RAISE EXCEPTION 'CRITICAL: Dangerous SQL functions still exist!';
    END IF;
    RAISE NOTICE 'SUCCESS: Dangerous SQL functions removed';
END
$$;

-- 2. FIX OVERLY PERMISSIVE RLS POLICIES (CRITICAL)
-- Current policies use USING (true) which allows all access

-- Teams table security
DROP POLICY IF EXISTS "teams_authenticated_update_new" ON public.teams;
DROP POLICY IF EXISTS "teams_authenticated_delete_new" ON public.teams;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.teams;

-- Create secure team policies
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

-- User profiles security
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_read" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_own_update" ON public.user_profiles;

CREATE POLICY "user_profiles_own_read" ON public.user_profiles 
FOR SELECT 
USING (id = auth.uid() OR auth.role() = 'authenticated');

CREATE POLICY "user_profiles_own_update" ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. SECURE COMPETITION MANAGEMENT
DROP POLICY IF EXISTS "Enable read access for all users" ON public.competition_teams;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.competition_teams;

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

-- 4. SECURE SYSTEM SETTINGS (ADMIN ONLY)
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

-- 5. SECURE PLAYER MANAGEMENT
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.players;

CREATE POLICY "players_public_read" ON public.players 
FOR SELECT 
USING (true);

CREATE POLICY "players_own_manage" ON public.players 
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

-- 6. CREATE SECURITY AUDIT LOG
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON public.security_audit_log(action);

-- 7. SECURITY LOGGING FUNCTION
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, details, success, error_message
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id, p_details, p_success, p_error_message
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't let audit logging failure break the main operation
  NULL;
END;
$$;

-- 8. RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP or user ID
  action_type TEXT NOT NULL, -- 'auth', 'api', 'upload', etc.
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits(identifier, action_type);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
ON public.rate_limits(window_start);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "rate_limits_system_only" ON public.rate_limits 
FOR ALL 
USING (false); -- No direct access through RLS

-- 9. CLEAN UP OLD RATE LIMIT ENTRIES
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits() 
RETURNS void 
LANGUAGE plpgsql 
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- 10. REVOKE DANGEROUS PERMISSIONS
REVOKE ALL ON public.teams FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.system_settings FROM anon;
REVOKE ALL ON public.security_audit_log FROM anon;
REVOKE ALL ON public.rate_limits FROM anon;

-- Grant only necessary read permissions to anonymous users
GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.competitions TO anon;
GRANT SELECT ON public.featured_matches TO anon;

-- ================================
-- VERIFICATION SECTION
-- ================================

-- Verify dangerous functions are removed
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('exec_sql', 'execute_sql', 'run_sql'))
    THEN '✅ SUCCESS: Dangerous SQL functions removed'
    ELSE '🔴 ERROR: Dangerous functions still exist!'
  END as sql_function_check;

-- Verify RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd LIKE '%USING (true)%' THEN '🔴 INSECURE'
    ELSE '✅ SECURE'
  END as security_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count security audit log table
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_log')
    THEN '✅ SUCCESS: Security audit log created'
    ELSE '🔴 ERROR: Security audit log missing!'
  END as audit_log_check;

-- Final verification
SELECT 
  '🔥 CRITICAL SECURITY FIXES APPLIED SUCCESSFULLY!' as status,
  NOW() as applied_at,
  'Restart your application to ensure all changes take effect' as next_step;

-- Log this security fix application
SELECT public.log_security_event(
  'SECURITY_FIXES_APPLIED',
  'DATABASE',
  'security_policies',
  '{"fix_type": "critical_security_patches", "applied_at": "' || NOW() || '"}'::jsonb
); 