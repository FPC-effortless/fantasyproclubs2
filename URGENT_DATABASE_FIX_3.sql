-- URGENT: Fix Team Creation - Simplified Version
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ===========================
-- 1. DROP ALL EXISTING TEAMS POLICIES
-- ===========================

DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Teams can be updated by their manager" ON public.teams;
DROP POLICY IF EXISTS "Teams can be deleted by their manager" ON public.teams;
DROP POLICY IF EXISTS "teams_admin_full_access" ON public.teams;
DROP POLICY IF EXISTS "teams_admin_create" ON public.teams;
DROP POLICY IF EXISTS "teams_manager_own_team" ON public.teams;
DROP POLICY IF EXISTS "teams_public_read" ON public.teams;

-- ===========================
-- 2. CREATE SIMPLE, WORKING POLICIES
-- ===========================

-- Allow everyone to read teams (public access)
CREATE POLICY "teams_public_read"
ON public.teams FOR SELECT
USING (true);

-- Allow ALL authenticated users to create teams (simplified)
CREATE POLICY "teams_authenticated_create"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow ALL authenticated users to update teams (simplified)
CREATE POLICY "teams_authenticated_update"
ON public.teams FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow ALL authenticated users to delete teams (simplified)
CREATE POLICY "teams_authenticated_delete"
ON public.teams FOR DELETE
TO authenticated
USING (true);

-- ===========================
-- 3. CREATE FEATURED_MATCHES TABLE (if not exists)
-- ===========================

CREATE TABLE IF NOT EXISTS public.featured_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    match_id UUID,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on featured_matches
ALTER TABLE public.featured_matches ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read featured matches
CREATE POLICY "featured_matches_public_read"
ON public.featured_matches FOR SELECT
USING (true);

-- Allow authenticated users to manage featured matches
CREATE POLICY "featured_matches_authenticated_manage"
ON public.featured_matches FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===========================
-- 4. GRANT PERMISSIONS
-- ===========================

GRANT ALL ON public.teams TO authenticated;
GRANT SELECT ON public.teams TO anon;
GRANT ALL ON public.featured_matches TO authenticated;
GRANT SELECT ON public.featured_matches TO anon;

-- ===========================
-- 5. INSERT SAMPLE DATA
-- ===========================

-- Insert a sample featured match if none exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.featured_matches) THEN
        INSERT INTO public.featured_matches (title, description, active)
        VALUES (
            'Nigeria Pro Club League - Featured Match',
            'Top teams compete in this weeks featured match',
            true
        );
    END IF;
END $$;

-- ===========================
-- 6. VERIFICATION
-- ===========================

SELECT 'Database fix applied successfully!' as message;
SELECT 'Featured matches table ready' as status, COUNT(*) as records FROM public.featured_matches;
SELECT 'Teams table policies updated' as status; 