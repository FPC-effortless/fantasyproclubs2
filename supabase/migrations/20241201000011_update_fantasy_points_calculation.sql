-- Update fantasy points calculation to use new system
-- Date: 2024-12-01

-- Drop the old trigger
DROP TRIGGER IF EXISTS update_fantasy_points_trigger ON public.player_match_stats;

-- Update the fantasy points calculation function with new logic
CREATE OR REPLACE FUNCTION public.update_fantasy_points()
RETURNS TRIGGER AS $$
DECLARE
  v_position TEXT;
  v_fantasy_role TEXT;
  v_points DECIMAL := 0;
  v_rating INTEGER;
BEGIN
  -- Get player position and convert to fantasy role
  SELECT position INTO v_position
  FROM public.players
  WHERE id = NEW.player_id;

  -- Map position to fantasy role
  v_fantasy_role := CASE 
    WHEN v_position = 'GK' THEN 'GK'
    WHEN v_position IN ('CB', 'LB', 'RB', 'LWB', 'RWB') THEN 'DEF'
    WHEN v_position IN ('CDM', 'CM', 'CAM', 'LM', 'RM') THEN 'MID'
    WHEN v_position IN ('LW', 'RW', 'ST', 'CF') THEN 'FWD'
    ELSE 'MID' -- Default to midfielder if unknown
  END;

  -- Rating bonus system
  v_rating := FLOOR(COALESCE(NEW.rating, 0));
  v_points := v_points + CASE v_rating
    WHEN 10 THEN 5
    WHEN 9 THEN 4
    WHEN 8 THEN 3
    WHEN 7 THEN 2
    WHEN 6 THEN 1
    ELSE 0
  END;

  -- Appearance points (if they played)
  IF NEW.minutes_played > 0 THEN
    v_points := v_points + 2;
  END IF;

  -- Assists (3 points each)
  v_points := v_points + (COALESCE(NEW.assists, 0) * 3);

  -- Man of the Match (3 points)
  IF NEW.motm THEN
    v_points := v_points + 3;
  END IF;

  -- Red card penalty (-3 points)
  IF NEW.red_cards > 0 THEN
    v_points := v_points - 3;
  END IF;

  -- Position-specific scoring
  CASE v_fantasy_role
    WHEN 'FWD' THEN
      -- Forwards: 4 points per goal
      v_points := v_points + (COALESCE(NEW.goals, 0) * 4);
      
    WHEN 'MID' THEN
      -- Midfielders: 5 points per goal, 2 for clean sheet, possessions bonus
      v_points := v_points + (COALESCE(NEW.goals, 0) * 5);
      IF NEW.clean_sheet THEN
        v_points := v_points + 2;
      END IF;
      -- Note: possessions_won field would need to be added to player_match_stats
      
    WHEN 'DEF' THEN
      -- Defenders: 6 points per goal, 4 for clean sheet, possessions bonus, goals conceded penalty
      v_points := v_points + (COALESCE(NEW.goals, 0) * 6);
      IF NEW.clean_sheet THEN
        v_points := v_points + 4;
      END IF;
      -- Note: goals_conceded and possessions_won fields would need to be added
      
    WHEN 'GK' THEN
      -- Goalkeepers: 10 points per goal, 6 for clean sheet, saves bonus, penalty saves, goals conceded penalty
      v_points := v_points + (COALESCE(NEW.goals, 0) * 10);
      IF NEW.clean_sheet THEN
        v_points := v_points + 6;
      END IF;
      -- Saves bonus (0.5 points per save, rounded down)
      v_points := v_points + FLOOR(COALESCE(NEW.saves, 0) / 2);
      -- Penalty saves (5 points each)
      v_points := v_points + (COALESCE(NEW.penalty_saves, 0) * 5);
      -- Note: goals_conceded field would need to be added for penalty
  END CASE;

  -- Update or insert fantasy_player_stats
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
    fantasy_points = fantasy_player_stats.fantasy_points + v_points,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_fantasy_points_trigger
  AFTER INSERT OR UPDATE
  ON public.player_match_stats
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.update_fantasy_points();

-- Add helpful comment
COMMENT ON FUNCTION public.update_fantasy_points() IS 'Updated fantasy points calculation using new rating-based system with position-specific scoring';

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Fantasy points calculation updated with new system';
END $$; 