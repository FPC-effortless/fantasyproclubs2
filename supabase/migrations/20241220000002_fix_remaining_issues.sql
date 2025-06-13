-- Fix remaining database issues
-- 1. Create featured_matches table
-- 2. Fix team creation RLS policies

-- Create featured_matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.featured_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
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

-- Fix teams table RLS policies - allow admins to create teams
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON public.teams;
DROP POLICY IF EXISTS "teams_admin_full_access" ON public.teams;

-- Recreate team creation policy for admins
CREATE POLICY "teams_admin_create"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

-- Allow admins full access to teams
CREATE POLICY "teams_admin_full_access"
ON public.teams FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.user_type = 'admin'
    )
);

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

-- Grant necessary permissions
GRANT SELECT ON public.featured_matches TO authenticated;
GRANT SELECT ON public.featured_matches TO anon; 