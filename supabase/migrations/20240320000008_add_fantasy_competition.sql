-- Add fantasy_enabled column to competitions table
ALTER TABLE public.competitions
ADD COLUMN fantasy_enabled BOOLEAN DEFAULT false;

-- Create table for competition-specific fantasy player stats
CREATE TABLE public.fantasy_player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  fantasy_points DECIMAL(10, 2) DEFAULT 0.0,
  fantasy_price DECIMAL(10, 2) DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, competition_id)
);

-- Add RLS policies
ALTER TABLE public.fantasy_player_stats ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.fantasy_player_stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to update fantasy stats
CREATE POLICY "Enable fantasy stats updates for admins" ON public.fantasy_player_stats
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER set_fantasy_player_stats_updated_at
  BEFORE UPDATE ON public.fantasy_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 