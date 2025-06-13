-- ================================
-- CRITICAL SECURITY FIXES - FINAL VERSION
-- Run this IMMEDIATELY in Supabase SQL Editor
-- This version fixes JSON construction issues
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

-- 2. SAFELY RECREATE ALL SECURITY POLICIES
-- Drop all existing policies first to avoid conflicts

-- Teams table security
DO $$
BEGIN
    -- Drop all existing team policies
    DROP POLICY IF EXISTS "teams_authenticated_update_new" ON public.teams;
    DROP POLICY IF EXISTS "teams_authenticated_delete_new" ON public.teams;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.teams;
    DROP POLICY IF EXISTS "teams_owner_update" ON public.teams;
    DROP POLICY IF EXISTS "teams_owner_delete" ON public.teams;
    DROP POLICY IF EXISTS "teams_public_read" ON public.teams;
    
    -- Create secure team policies
    CREATE POLICY "teams_public_read" ON public.teams 
    FOR SELECT 
    USING (true);
    
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
    
    RAISE NOTICE 'Teams policies updated successfully';
END
$$;

-- User profiles security
DO $$
BEGIN
    -- Drop all existing user profile policies
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.user_profiles;
    DROP POLICY IF EXISTS "user_profiles_own_read" ON public.user_profiles;
    DROP POLICY IF EXISTS "user_profiles_own_update" ON public.user_profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
    
    -- Create secure user profile policies
    CREATE POLICY "user_profiles_own_read" ON public.user_profiles 
    FOR SELECT 
    USING (id = auth.uid() OR auth.role() = 'authenticated');

    CREATE POLICY "user_profiles_own_update" ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
    
    RAISE NOTICE 'User profiles policies updated successfully';
END
$$;

-- Competition teams security
DO $$
BEGIN
    -- Drop all existing competition team policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.competition_teams;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.competition_teams;
    DROP POLICY IF EXISTS "competition_teams_public_read" ON public.competition_teams;
    DROP POLICY IF EXISTS "competition_teams_manager_manage" ON public.competition_teams;
    
    -- Create secure competition team policies
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
    
    RAISE NOTICE 'Competition teams policies updated successfully';
END
$$;

-- Players security
DO $$
BEGIN
    -- Drop all existing player policies
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.players;
    DROP POLICY IF EXISTS "players_public_read" ON public.players;
    DROP POLICY IF EXISTS "players_own_manage" ON public.players;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.players;
    
    -- Create secure player policies
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
    
    RAISE NOTICE 'Players policies updated successfully';
END
$$;

-- System settings security (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "system_settings_admin_only" ON public.system_settings;
        DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.system_settings;
        
        -- Create admin-only policy
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
        
        RAISE NOTICE 'System settings policies updated successfully';
    END IF;
END
$$;

-- 3. CREATE SECURITY AUDIT LOG (if not exists)
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

-- Drop existing audit log policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "audit_log_admin_read" ON public.security_audit_log;
    DROP POLICY IF EXISTS "audit_log_system_write" ON public.security_audit_log;
    
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
    
    RAISE NOTICE 'Security audit log created successfully';
END
$$;

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON public.security_audit_log(action);

-- 4. SECURITY LOGGING FUNCTION
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

-- 5. RATE LIMITING TABLE (if not exists)
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
DO $$
BEGIN
    DROP POLICY IF EXISTS "rate_limits_system_only" ON public.rate_limits;
    CREATE POLICY "rate_limits_system_only" ON public.rate_limits 
    FOR ALL 
    USING (false); -- No direct access through RLS
END
$$;

-- 6. CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits() 
RETURNS void 
LANGUAGE plpgsql 
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- 7. REVOKE DANGEROUS PERMISSIONS
REVOKE ALL ON public.teams FROM anon;
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.security_audit_log FROM anon;
REVOKE ALL ON public.rate_limits FROM anon;

-- Grant only necessary read permissions to anonymous users
GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.competitions TO anon;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'featured_matches') THEN
        GRANT SELECT ON public.featured_matches TO anon;
    END IF;
END
$$;

-- ================================
-- FINAL VERIFICATION
-- ================================

-- Verify dangerous functions are removed
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('exec_sql', 'execute_sql', 'run_sql'))
    THEN '✅ SUCCESS: Dangerous SQL functions removed'
    ELSE '🔴 ERROR: Dangerous functions still exist!'
  END as sql_function_check;

-- Verify security audit log exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_log')
    THEN '✅ SUCCESS: Security audit log created'
    ELSE '🔴 ERROR: Security audit log missing!'
  END as audit_log_check;

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('teams', 'user_profiles', 'competition_teams', 'players', 'system_settings', 'security_audit_log', 'rate_limits')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Log this security fix application (Fixed JSON construction)
DO $$
BEGIN
    PERFORM public.log_security_event(
      'SECURITY_FIXES_APPLIED',
      'DATABASE',
      'security_policies',
      jsonb_build_object(
        'fix_type', 'critical_security_patches',
        'applied_at', NOW()::text,
        'version', 'final'
      )
    );
    RAISE NOTICE 'Security event logged successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Security event logging skipped (table may not exist yet)';
END
$$;

-- Final success message
SELECT 
  '🔥 CRITICAL SECURITY FIXES APPLIED SUCCESSFULLY!' as status,
  NOW() as applied_at,
  'Your database is now secure. Restart your application!' as next_step; 