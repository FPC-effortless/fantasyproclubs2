-- Add fantasy_enabled column to competitions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'competitions' 
        AND column_name = 'fantasy_enabled'
    ) THEN
        ALTER TABLE public.competitions
        ADD COLUMN fantasy_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create fantasy_player_stats table
CREATE TABLE IF NOT EXISTS public.fantasy_player_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    fantasy_points DECIMAL(10, 2) DEFAULT 0.0,
    fantasy_price DECIMAL(10, 2) DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(player_id, competition_id)
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_fantasy_player_stats_updated_at
    BEFORE UPDATE ON public.fantasy_player_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Add new columns to player_match_stats if they don't exist
DO $$ 
BEGIN
    -- Add status column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    -- Add clean_sheet column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'clean_sheet'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN clean_sheet BOOLEAN DEFAULT false;
    END IF;

    -- Add saves column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'saves'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN saves INTEGER DEFAULT 0;
    END IF;

    -- Add penalty_saves column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'penalty_saves'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN penalty_saves INTEGER DEFAULT 0;
    END IF;

    -- Add own_goals column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'own_goals'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN own_goals INTEGER DEFAULT 0;
    END IF;

    -- Add penalty_misses column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'penalty_misses'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN penalty_misses INTEGER DEFAULT 0;
    END IF;

    -- Add motm column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'motm'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN motm BOOLEAN DEFAULT false;
    END IF;

    -- Add competition_id column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'player_match_stats' 
        AND column_name = 'competition_id'
    ) THEN
        ALTER TABLE public.player_match_stats
        ADD COLUMN competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for faster fantasy point calculations
CREATE INDEX IF NOT EXISTS idx_player_match_stats_competition
ON public.player_match_stats(competition_id);

CREATE INDEX IF NOT EXISTS idx_fantasy_player_stats_competition
ON public.fantasy_player_stats(competition_id);

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