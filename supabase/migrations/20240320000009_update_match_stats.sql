-- Add new columns to player_match_stats table
ALTER TABLE public.player_match_stats
ADD COLUMN IF NOT EXISTS clean_sheet BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS saves INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_saves INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS own_goals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_misses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS motm BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE;

-- Create index for faster fantasy point calculations
CREATE INDEX IF NOT EXISTS idx_player_match_stats_competition
ON public.player_match_stats(competition_id);

-- Create function to update fantasy points
CREATE OR REPLACE FUNCTION public.update_fantasy_points()
RETURNS TRIGGER AS $$
DECLARE
  v_position TEXT;
  v_points DECIMAL;
BEGIN
  -- Get player position
  SELECT position INTO v_position
  FROM public.players
  WHERE id = NEW.player_id;

  -- Calculate points based on position and stats
  v_points := (
    CASE v_position
      WHEN 'GK' THEN (NEW.goals * 6)
      WHEN 'DEF' THEN (NEW.goals * 6)
      WHEN 'MID' THEN (NEW.goals * 5)
      WHEN 'FWD' THEN (NEW.goals * 4)
    END +
    (NEW.assists * 3) +
    CASE 
      WHEN NEW.minutes_played >= 60 THEN 2
      WHEN NEW.minutes_played > 0 THEN 1
      ELSE 0
    END +
    CASE
      WHEN NEW.rating >= 8.0 THEN 3
      WHEN NEW.rating >= 7.0 THEN 1
      ELSE 0
    END +
    CASE
      WHEN NEW.clean_sheet AND v_position IN ('GK', 'DEF') THEN 4
      WHEN NEW.clean_sheet AND v_position = 'MID' THEN 1
      ELSE 0
    END +
    (NEW.yellow_cards * -1) +
    (NEW.red_cards * -3) +
    CASE
      WHEN v_position = 'GK' THEN (
        (NEW.saves * 0.5) +
        (NEW.penalty_saves * 5)
      )
      ELSE 0
    END +
    (NEW.own_goals * -2) +
    (NEW.penalty_misses * -2) +
    CASE WHEN NEW.motm THEN 3 ELSE 0 END
  );

  -- Update fantasy_player_stats
  INSERT INTO public.fantasy_player_stats (
    player_id,
    competition_id,
    fantasy_points
  ) VALUES (
    NEW.player_id,
    NEW.competition_id,
    v_points
  )
  ON CONFLICT (player_id, competition_id)
  DO UPDATE SET
    fantasy_points = fantasy_player_stats.fantasy_points + v_points;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update fantasy points
DROP TRIGGER IF EXISTS update_fantasy_points_trigger ON public.player_match_stats;
CREATE TRIGGER update_fantasy_points_trigger
  AFTER INSERT OR UPDATE
  ON public.player_match_stats
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.update_fantasy_points(); 