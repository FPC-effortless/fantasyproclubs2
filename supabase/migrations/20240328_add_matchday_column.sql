-- Add matchday column to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS matchday INTEGER;
 
-- Add index for matchday
CREATE INDEX IF NOT EXISTS idx_matches_matchday ON public.matches(matchday); 