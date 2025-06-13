-- Fix teams table RLS to ensure admins can access teams
-- Drop existing teams policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams;
DROP POLICY IF EXISTS "Teams can be updated by their manager" ON teams;
DROP POLICY IF EXISTS "Teams can be deleted by their manager" ON teams;

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Allow public read access to teams (for public views)
CREATE POLICY "Teams are viewable by everyone"
    ON teams FOR SELECT
    USING (true);

-- Allow admins full access to teams
CREATE POLICY "Teams can be managed by admins"
    ON teams FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    );

-- Allow team managers to manage their own teams
CREATE POLICY "Teams can be updated by their manager"
    ON teams FOR UPDATE
    TO authenticated
    USING (auth.uid() = manager_id)
    WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Teams can be deleted by their manager"
    ON teams FOR DELETE
    TO authenticated
    USING (auth.uid() = manager_id);

-- Allow team creation by authenticated users (managers and admins)
CREATE POLICY "Teams can be created by authenticated users"
    ON teams FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = manager_id OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type = 'admin'
        )
    ); 