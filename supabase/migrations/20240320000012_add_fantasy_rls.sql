-- Enable RLS on competitions table
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view competitions
CREATE POLICY "Allow authenticated users to view competitions"
ON public.competitions
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to update fantasy settings
CREATE POLICY "Allow admins to update fantasy settings"
ON public.competitions
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

-- Enable RLS on fantasy_player_stats table
ALTER TABLE public.fantasy_player_stats ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view fantasy stats
CREATE POLICY "Allow authenticated users to view fantasy stats"
ON public.fantasy_player_stats
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to update fantasy stats
CREATE POLICY "Allow admins to update fantasy stats"
ON public.fantasy_player_stats
FOR ALL
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