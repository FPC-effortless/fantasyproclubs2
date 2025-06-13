-- Add fantasy_price column to players table
ALTER TABLE public.players
ADD COLUMN fantasy_price DECIMAL(10, 2) DEFAULT 0.0;

-- Add comment to explain the column
COMMENT ON COLUMN public.players.fantasy_price IS 'The price of the player in fantasy mode';

-- Update RLS policies to allow admins to update fantasy prices
CREATE POLICY "Enable fantasy price updates for admins" ON public.players
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