-- Fix RLS policies for fantasy_player_stats table
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.fantasy_player_stats;
DROP POLICY IF EXISTS "Enable fantasy stats updates for admins" ON public.fantasy_player_stats;
DROP POLICY IF EXISTS "Allow authenticated users to view fantasy stats" ON public.fantasy_player_stats;
DROP POLICY IF EXISTS "Allow admins to update fantasy stats" ON public.fantasy_player_stats;

-- Create new comprehensive policies for fantasy_player_stats

-- Policy 1: Allow all authenticated users to read fantasy stats
CREATE POLICY "fantasy_player_stats_select_policy"
ON public.fantasy_player_stats
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow admins to insert fantasy stats
CREATE POLICY "fantasy_player_stats_insert_policy"
ON public.fantasy_player_stats
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type = 'admin'
  )
);

-- Policy 3: Allow admins to update fantasy stats
CREATE POLICY "fantasy_player_stats_update_policy"
ON public.fantasy_player_stats
FOR UPDATE
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

-- Policy 4: Allow admins to delete fantasy stats
CREATE POLICY "fantasy_player_stats_delete_policy"
ON public.fantasy_player_stats
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type = 'admin'
  )
);

-- Log the fix
SELECT 'Fantasy player stats RLS policies have been fixed' as message; 