-- URGENT: Fix App Database Issues
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ===========================
-- 1. CREATE FEATURED_MATCHES TABLE
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

-- Allow admins to manage featured matches
CREATE POLICY "featured_matches_admin_full_access"
ON public.featured_matches FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- ===========================
-- 2. FIX TEAMS TABLE RLS POLICIES
-- ===========================

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON public.teams;
DROP POLICY IF EXISTS "teams_admin_full_access" ON public.teams;
DROP POLICY IF EXISTS "teams_admin_create" ON public.teams;

-- Create comprehensive admin access policy
CREATE POLICY "teams_admin_full_access"
ON public.teams FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- ===========================
-- 3. INSERT SAMPLE DATA
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
-- 4. GRANT PERMISSIONS
-- ===========================

GRANT SELECT ON public.featured_matches TO authenticated;
GRANT SELECT ON public.featured_matches TO anon;
GRANT ALL ON public.teams TO authenticated;

-- ===========================
-- 5. VERIFICATION
-- ===========================

-- Check if everything was created successfully
SELECT 'Featured matches table created successfully' as message,
       COUNT(*) as record_count
FROM public.featured_matches;

SELECT 'Teams table policies updated successfully' as message;

-- Show current user profile for verification
SELECT 'Current user profile:' as message, user_type 
FROM public.user_profiles 
WHERE id = auth.uid(); 