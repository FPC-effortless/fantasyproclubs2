-- Function to get the overall top scorer across all competitions
CREATE OR REPLACE FUNCTION get_top_scorer()
RETURNS TABLE (display_name TEXT, total_goals BIGINT)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.display_name,
    SUM(pms.goals)::BIGINT AS total_goals
  FROM player_match_stats pms
  JOIN players p ON pms.player_id = p.id
  JOIN user_profiles up ON p.user_id = up.user_id
  WHERE pms.goals > 0
  GROUP BY up.display_name
  ORDER BY total_goals DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get the top scorer for a specific competition
CREATE OR REPLACE FUNCTION get_competition_top_scorer(comp_id UUID)
RETURNS TABLE (display_name TEXT, total_goals BIGINT)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.display_name,
    SUM(pms.goals)::BIGINT AS total_goals
  FROM player_match_stats pms
  JOIN players p ON pms.player_id = p.id
  JOIN user_profiles up ON p.user_id = up.user_id
  JOIN matches m ON pms.match_id = m.id
  WHERE m.competition_id = comp_id AND pms.goals > 0
  GROUP BY up.display_name
  ORDER BY total_goals DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql; 